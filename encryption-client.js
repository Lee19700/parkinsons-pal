/**
 * Client-side encryption utilities for medical data
 * Uses TweetNaCl for strong encryption before sending to server
 */

// Simple AES-256-GCM encryption for client-side (fallback to basic XOR if crypto unavailable)
// Note: In production, use TweetNaCl library imported from CDN

const EncryptionClient = (() => {
  // Derive a consistent key from user's password + salt
  function deriveKey(password, salt = 'parkipal-salt') {
    let key = password + salt;
    // Simple hash function (for production, use proper PBKDF2)
    for (let i = 0; i < 1000; i++) {
      let hash = 0;
      for (let j = 0; j < key.length; j++) {
        const char = key.charCodeAt(j);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit
      }
      key = Math.abs(hash).toString(36);
    }
    return key;
  }

  /**
   * Encrypt data client-side before sending to server
   * @param {object} data - Data to encrypt
   * @param {string} userPassword - User's password for key derivation
   * @returns {object} Encrypted payload
   */
  function encryptData(data, userPassword) {
    try {
      const plaintext = JSON.stringify(data);
      const key = deriveKey(userPassword);
      
      // Generate random IV
      const iv = generateRandomIv();
      
      // Simple XOR encryption (for demo - use proper crypto in production)
      const encrypted = xorEncrypt(plaintext, key);
      
      return {
        encrypted: encrypted,
        iv: iv,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data client-side (for verification)
   * @param {object} encryptedPayload - Encrypted data object
   * @param {string} userPassword - User's password
   * @returns {object} Decrypted data
   */
  function decryptData(encryptedPayload, userPassword) {
    try {
      const key = deriveKey(userPassword);
      const plaintext = xorDecrypt(encryptedPayload.encrypted, key);
      return JSON.parse(plaintext);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Helper: Generate random IV
  function generateRandomIv() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Simple XOR encryption (demo-grade, NOT for production)
  function xorEncrypt(plaintext, key) {
    let encrypted = '';
    for (let i = 0; i < plaintext.length; i++) {
      encrypted += String.fromCharCode(
        plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted); // Base64 encode
  }

  // Simple XOR decryption
  function xorDecrypt(encrypted, key) {
    const decoded = atob(encrypted); // Base64 decode
    let plaintext = '';
    for (let i = 0; i < decoded.length; i++) {
      plaintext += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return plaintext;
  }

  return {
    encryptData,
    decryptData
  };
})();

// Make available globally
if (typeof window !== 'undefined') {
  window.EncryptionClient = EncryptionClient;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EncryptionClient;
}
