// Parkinson's Pal Backend Server
// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const dbAdapter = require('./db');
const jwt = require('jsonwebtoken');
const encryption = require('./encryption');
const { initEmailService, sendPasswordResetEmail, sendWelcomeEmail } = require('./email');

const app = express();
// Behind a reverse proxy (e.g., Caddy), trust the first hop for IPs
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';
const MAX_BODY_MB = parseInt(process.env.MAX_BODY_MB || '10', 10); // request body size limit in MB
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '120', 10); // 120 requests per window per IP
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_RATE_LIMIT_MAX = 5; // 5 failed attempts per 15 minutes
let isReady = false;
console.log('[STARTUP] Loading environment variables...');
console.log(`[STARTUP] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[STARTUP] PORT: ${process.env.PORT || 3000}`);
console.log(`[STARTUP] DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
if (process.env.DATABASE_URL) {
  const dbUrlMasked = process.env.DATABASE_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
  console.log(`[STARTUP] DATABASE_URL preview: ${dbUrlMasked.substring(0, 100)}...`);
  console.log(`[STARTUP] DATABASE_URL length: ${process.env.DATABASE_URL.length}`);
}

// Start server only after DB is ready
async function startServer() {
  try {
    console.log('[DB] Initializing database connection...');
    await dbAdapter.init();
    isReady = true;
    console.log('[DB] Database initialized successfully');
    
    // Initialize email service
    console.log('[EMAIL] Initializing email service...');
    await initEmailService();
    
    // NOW start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Parkinson's Pal API server running on port ${PORT}`);
      console.log('[SERVER] Ready to accept requests');
    });
    
    server.on('error', (err) => {
      console.error('[SERVER] Server error:', err.message);
      process.exit(1);
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('[FATAL] Uncaught exception:', error.message);
      console.error('[FATAL] Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[FATAL] Unhandled rejection:', reason?.message || reason);
      console.error('[FATAL] Stack:', reason?.stack);
      process.exit(1);
    });

    function shutdown() {
      console.log('[SERVER] Shutting down...');
      server.close(() => {
        console.log('[SERVER] Server closed, exiting...');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('[SERVER] Forced exit after timeout');
        process.exit(0);
      }, 5000);
    }

    process.on('SIGTERM', () => {
      console.log('[SERVER] Received SIGTERM');
      shutdown();
    });
    process.on('SIGINT', () => {
      console.log('[SERVER] Received SIGINT');
      shutdown();
    });
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error.message);
    console.error('[DB] Full error:', error);
    console.error('[DB] DATABASE_URL:', process.env.DATABASE_URL);
    process.exit(1);
  }
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
}));
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: `${MAX_BODY_MB}mb` }));

// Basic rate limiting (per-IP, in-memory)
const reqCounts = new Map();
const loginAttempts = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = reqCounts.get(ip);
  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 0 };
    reqCounts.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = loginAttempts.get(ip);
  if (!entry || now - entry.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 0 };
    loginAttempts.set(ip, entry);
  }
  if (entry.count >= LOGIN_RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
  }
  next();
}

app.use(rateLimiter);

// Serve static frontend files from parent directory (when deployed)
const path = require('path');
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    // Don't cache HTML files; cache assets (js, css, etc) for 1 week
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
    }
  }
}));

app.use((req, res, next) => {
  if (!isReady && req.path !== '/api/health') {
    return res.status(503).json({ error: 'Service initializing' });
  }
  next();
});

// Initialize database tables
// Schema is created by db adapter
/*
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    dob TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT,
    times TEXT,
    stock INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS med_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    med_name TEXT NOT NULL,
    tablets_used INTEGER DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    systolic INTEGER,
    diastolic INTEGER,
    heart_rate INTEGER,
    temperature REAL,
    oxygen INTEGER,
    respiratory_rate INTEGER,
    consciousness TEXT,
    news2_score INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS symptoms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tremor INTEGER,
    bradykinesia INTEGER,
    rigidity INTEGER,
    gait INTEGER,
    dyskinesia INTEGER,
    sleep INTEGER,
    mood INTEGER,
    cognition INTEGER,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS fluids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    meal_type TEXT,
    food_items TEXT,
    protein TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_type TEXT,
    duration INTEGER,
    intensity TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_data BLOB,
    file_type TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS access_grants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    scope TEXT DEFAULT 'all',
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
  );
*/

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Helper functions for password hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return computedHash === hash;
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, display } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (username.length > 50) {
      return res.status(400).json({ error: 'Username must not exceed 50 characters' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must not exceed 128 characters' });
    }

    // Basic password complexity check
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and numbers' });
    }

    const passwordHash = hashPassword(password);
    
    const result = await dbAdapter.run('INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $3)', [username, passwordHash, display || username]);
    
    const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      ok: true, 
      token,
      user: { id: result.lastInsertRowid, username, display: display || username }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await dbAdapter.get('SELECT * FROM users WHERE username = $1', [username]);
    
    if (!user || !verifyPassword(password, user.password_hash)) {
      // Increment failed login counter
      const now = Date.now();
      let entry = loginAttempts.get(ip);
      if (!entry || now - entry.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
        entry = { windowStart: now, count: 0 };
      }
      entry.count += 1;
      loginAttempts.set(ip, entry);
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Clear login attempts on successful login
    loginAttempts.delete(ip);
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      ok: true, 
      token,
      user: { id: user.id, username: user.username, display: user.display_name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password Reset Routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    const user = await dbAdapter.get('SELECT id, email FROM users WHERE username = $1', [username]);
    
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.status(200).json({ ok: true, message: 'If user exists, reset email would be sent' });
    }

    if (!user.email) {
      // User exists but no email on file
      return res.status(200).json({ ok: true, message: 'If user exists, reset email would be sent' });
    }
    
    // Generate a secure reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    await dbAdapter.run(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );
    
    // Build reset URL
    const appUrl = process.env.APP_URL || 'https://parkinsonspal.app';
    const resetUrl = `${appUrl}/reset-password.html?token=${resetToken}`;
    
    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, username, resetToken, resetUrl);
    
    if (emailResult.success) {
      return res.status(200).json({ ok: true, message: 'Password reset email sent' });
    }
    
    // Email failed, but don't reveal why
    return res.status(200).json({ ok: true, message: 'If user exists, reset email would be sent' });
  } catch (error) {
    console.error('[AUTH] Password reset request failed:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and numbers' });
    }
    
    const now = new Date().toISOString();
    const tokenRecord = await dbAdapter.get(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > $2',
      [resetToken, now]
    );
    
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const newPasswordHash = hashPassword(newPassword);
    
    await dbAdapter.run(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, tokenRecord.user_id]
    );
    
    // Delete used token
    await dbAdapter.run(
      'DELETE FROM password_reset_tokens WHERE id = $1',
      [tokenRecord.id]
    );
    
    res.json({ ok: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// User Profile Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbAdapter.get('SELECT id, username, display_name, full_name, email, phone, dob, emergency_contact, notes FROM users WHERE id = $1', [req.user.id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { display_name, full_name, email, phone, dob, emergency_contact, notes } = req.body;
    await dbAdapter.run('UPDATE users SET display_name = $1, full_name = $2, email = $3, phone = $4, dob = $5, emergency_contact = $6, notes = $7 WHERE id = $8', [display_name, full_name, email, phone, dob, emergency_contact, notes, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Medications Routes
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const meds = await dbAdapter.all('SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(meds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, times, stock, notes } = req.body;
    const result = await dbAdapter.run('INSERT INTO medications (user_id, name, dosage, times, stock, notes) VALUES ($1, $2, $3, $4, $5, $6)', [req.user.id, name, dosage, times, stock || 0, notes]);
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add medication' });
  }
});

app.put('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, times, stock, notes } = req.body;
    await dbAdapter.run('UPDATE medications SET name = $1, dosage = $2, times = $3, stock = $4, notes = $5 WHERE id = $6 AND user_id = $7', [name, dosage, times, stock, notes, req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

app.delete('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.run('DELETE FROM medications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

// Vitals Routes
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const vitals = await dbAdapter.all('SELECT * FROM vitals WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100', [req.user.id]);
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { systolic, diastolic, heart_rate, temperature, oxygen, respiratory_rate, consciousness, news2_score } = req.body;
    const result = await dbAdapter.run('INSERT INTO vitals (user_id, systolic, diastolic, heart_rate, temperature, oxygen, respiratory_rate, consciousness, news2_score) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [req.user.id, systolic, diastolic, heart_rate, temperature, oxygen, respiratory_rate, consciousness, news2_score]);
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vitals' });
  }
});

// Med Logs Routes
app.get('/api/medlogs', authenticateToken, async (req, res) => {
  try {
    const logs = await dbAdapter.all('SELECT * FROM med_logs WHERE user_id = $1 ORDER BY timestamp DESC', [req.user.id]);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch med logs' });
  }
});

app.post('/api/medlogs', authenticateToken, async (req, res) => {
  try {
    const { med_name, tablets_used, timestamp, notes } = req.body;
    const result = await dbAdapter.run('INSERT INTO med_logs (user_id, med_name, tablets_used, timestamp, notes) VALUES ($1,$2,$3,$4,$5)', [req.user.id, med_name, tablets_used || 1, timestamp || new Date().toISOString(), notes]);
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add med log' });
  }
});

app.delete('/api/medlogs/:id', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.run('DELETE FROM med_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete med log' });
  }
});

// Load route modules
require('./routes/symptoms')(app, dbAdapter, authenticateToken);
require('./routes/fluids')(app, dbAdapter, authenticateToken);
require('./routes/foods')(app, dbAdapter, authenticateToken);
require('./routes/exercises')(app, dbAdapter, authenticateToken);
require('./routes/appointments')(app, dbAdapter, authenticateToken);
require('./routes/documents')(app, dbAdapter, authenticateToken);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: isReady ? 'ok' : 'starting', timestamp: new Date().toISOString() });
});

// Access Grants (Share records with doctors)
// Create grant: patient grants doctor read-only access until expires_at
app.post('/api/access/grants', authenticateToken, async (req, res) => {
  try {
    const { doctor_id, scope, expires_at } = req.body;
    if (!doctor_id) return res.status(400).json({ error: 'doctor_id required' });
    const result = await dbAdapter.run('INSERT INTO access_grants (patient_id, doctor_id, scope, expires_at) VALUES ($1, $2, $3, $4)', [req.user.id, doctor_id, scope || 'all', expires_at || null]);
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create access grant' });
  }
});

// Revoke grant
app.delete('/api/access/grants/:id', authenticateToken, async (req, res) => {
  try {
    await dbAdapter.run('DELETE FROM access_grants WHERE id = $1 AND patient_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to revoke access grant' });
  }
});

// Doctor: list patients who granted access
app.get('/api/access/patients', authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const rows = await dbAdapter.all('SELECT * FROM access_grants WHERE doctor_id = $1 AND (expires_at IS NULL OR expires_at > $2) ORDER BY created_at DESC', [req.user.id, now]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list access grants' });
  }
});

// Doctor: read patient records if active grant exists
app.get('/api/access/patient/:patientId/records', authenticateToken, async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const now = new Date().toISOString();
    const grant = await dbAdapter.get('SELECT * FROM access_grants WHERE patient_id = $1 AND doctor_id = $2 AND (expires_at IS NULL OR expires_at > $3)', [patientId, req.user.id, now]);
    if (!grant) return res.status(403).json({ error: 'No active access grant' });

    const meds = await dbAdapter.all('SELECT * FROM medications WHERE user_id = $1', [patientId]);
    const logs = await dbAdapter.all('SELECT * FROM med_logs WHERE user_id = $1', [patientId]);
    const vitals = await dbAdapter.all('SELECT * FROM vitals WHERE user_id = $1', [patientId]);
    const symptoms = await dbAdapter.all('SELECT * FROM symptoms WHERE user_id = $1', [patientId]);
    const fluids = await dbAdapter.all('SELECT * FROM fluids WHERE user_id = $1', [patientId]);
    const foods = await dbAdapter.all('SELECT * FROM foods WHERE user_id = $1', [patientId]);
    const exercises = await dbAdapter.all('SELECT * FROM exercises WHERE user_id = $1', [patientId]);
    const appointments = await dbAdapter.all('SELECT * FROM appointments WHERE user_id = $1', [patientId]);

    res.json({ meds, logs, vitals, symptoms, fluids, foods, exercises, appointments });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read patient records' });
  }
});

// SPA fallback: serve index.html for all non-API, non-static routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the app (after all middleware and routes are set up)
startServer();
