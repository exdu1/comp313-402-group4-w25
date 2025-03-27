// server/services/encryptionService.js
import crypto from 'crypto';

// Environment variables for encryption keys should be properly set
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-256-bit-key-used-for-message-encryption'; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text as hex string
 */
export const encrypt = (text) => {
  try {
    // Generate random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return iv + encrypted data as hex string
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts text using AES-256-CBC
 * @param {string} text - Encrypted text (iv:encryptedText format)
 * @returns {string} Decrypted text
 */
export const decrypt = (text) => {
  try {
    // Split iv and encrypted text
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Anonymizes user data by hashing sensitive fields
 * @param {Object} userData - User data to anonymize
 * @returns {Object} Anonymized user data
 */
export const anonymizeUserData = (userData) => {
  // Make a copy to avoid modifying the original
  const anonymized = { ...userData };
  
  // Hash email with SHA-256
  if (anonymized.email) {
    const hash = crypto.createHash('sha256');
    hash.update(anonymized.email);
    anonymized.anonymizedEmail = hash.digest('hex');
    delete anonymized.email;
  }
  
  // Remove sensitive fields
  delete anonymized.password;
  delete anonymized.resetPasswordToken;
  delete anonymized.resetPasswordExpire;
  delete anonymized.verificationToken;
  delete anonymized.verificationExpire;
  
  // Replace name with initials if available
  if (anonymized.displayName) {
    const words = anonymized.displayName.split(' ');
    anonymized.displayName = words.map(word => word[0] + '.').join(' ');
  }
  
  return anonymized;
};

/**
 * Generates a secure random token
 * @param {number} bytes - Number of bytes for the token
 * @returns {string} Hex string token
 */
export const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hashes a token using SHA-256
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  encrypt,
  decrypt,
  anonymizeUserData,
  generateToken,
  hashToken
};