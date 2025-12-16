// Encryption utilities for end-to-end encryption
const crypto = require('crypto');

// Master encryption key from environment - must be 32 bytes for AES-256
const MASTER_KEY = process.env.ENCRYPTION_KEY;

// Validate encryption key on startup
if (!MASTER_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable must be set (32 bytes hex string for AES-256)');
}

if (MASTER_KEY.length !== 64) { // 32 bytes = 64 hex characters
  throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)');
}

const keyBuffer = Buffer.from(MASTER_KEY, 'hex');

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string|object} data - Data to encrypt
 * @returns {object} { iv, authTag, encrypted } as hex strings
 */
function encrypt(data) {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Generate random IV (initialization vector)
  const iv = crypto.randomBytes(12); // 96 bits for GCM
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag for integrity verification
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted: encrypted
  };
}

/**
 * Decrypt data encrypted with encrypt()
 * @param {object} encryptedData - { iv, authTag, encrypted }
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData) {
  try {
    const { iv, authTag, encrypted } = encryptedData;
    
    if (!iv || !authTag || !encrypted) {
      throw new Error('Missing iv, authTag, or encrypted data');
    }
    
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Parse decrypted JSON safely
 * @param {string} decryptedJson - JSON string
 * @returns {object} Parsed object
 */
function decryptAndParse(encryptedData) {
  const decrypted = decrypt(encryptedData);
  try {
    return JSON.parse(decrypted);
  } catch (e) {
    // If not JSON, return as string
    return decrypted;
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  decryptAndParse,
  hashData
};
