 // Database adapter: Postgres only
const { Client } = require('pg');

// Heroku uses DATABASE_URL, local uses DB_URL
const DB_URL = process.env.DATABASE_URL || process.env.DB_URL;
let pg = null;

async function init() {
  if (!DB_URL) {
    throw new Error('DB_URL must be set for Postgres.');
  }
  // For Heroku: parse DATABASE_URL and enable SSL
  const clientConfig = {
    connectionString: DB_URL
  };
  if (process.env.NODE_ENV === 'production') {
    clientConfig.ssl = { rejectUnauthorized: false };
  }
  pg = new Client(clientConfig);
  await pg.connect();
  await createSchemaPg();
}

async function close() {
  if (pg) {
    await pg.end();
    pg = null;
  }
}

async function createSchemaPg() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      dob TEXT,
      emergency_contact TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      dosage TEXT,
      times TEXT,
      stock INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS med_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      med_name TEXT NOT NULL,
      tablets_used INTEGER DEFAULT 1,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS vitals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      systolic INTEGER,
      diastolic INTEGER,
      heart_rate INTEGER,
      temperature REAL,
      oxygen INTEGER,
      respiratory_rate INTEGER,
      consciousness TEXT,
      news2_score INTEGER,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      tremor INTEGER,
      bradykinesia INTEGER,
      rigidity INTEGER,
      gait INTEGER,
      dyskinesia INTEGER,
      sleep INTEGER,
      mood INTEGER,
      cognition INTEGER,
      notes TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fluids (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS foods (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      meal_type TEXT,
      food_items TEXT,
      protein TEXT,
      notes TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      exercise_type TEXT,
      duration INTEGER,
      intensity TEXT,
      notes TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      location TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      filename TEXT NOT NULL,
      file_data BYTEA,
      file_type TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS access_grants (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      scope TEXT DEFAULT 'all',
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add encrypted data columns for medical information
    ALTER TABLE medications ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE symptoms ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE vitals ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE fluids ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE foods ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE exercises ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
    ALTER TABLE med_logs ADD COLUMN IF NOT EXISTS encrypted_data JSONB;
  `;
  await pg.query(sql);
}

// Simple helpers mirroring better-sqlite3 patterns
function get(sql, params = []) {
  return pg.query(sql, params).then(r => r.rows[0]);
}

function all(sql, params = []) {
  return pg.query(sql, params).then(r => r.rows);
}

function run(sql, params = []) {
  return pg.query(sql + ' RETURNING id', params).then(r => ({ lastInsertRowid: r.rows?.[0]?.id }));
}

module.exports = { init, get, all, run, close };
