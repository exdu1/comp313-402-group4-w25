// server/utils/tokenService.js
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for a user
 * @param {string} userId - User ID to encode in the token
 * @param {string} secret - Secret key for signing
 * @param {string} expiresIn - Expiration time
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {object|null} Decoded token or null if invalid
 */
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Set JWT token as HTTP-only cookie
 * @param {object} res - Express response object
 * @param {string} token - JWT token
 * @param {number} maxAge - Cookie max age in milliseconds
 */
export const setTokenCookie = (res, token, maxAge = process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000) => {
  const cookieOptions = {
    expires: new Date(Date.now() + maxAge),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('token', token, cookieOptions);
};

/**
 * Clear token cookie
 * @param {object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
};

/**
 * Send token response
 * @param {object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {boolean} isNewUser - Whether this is a new user registration
 */
export const sendTokenResponse = (user, statusCode, res, isNewUser = false) => {
  // Create token
  const token = generateToken(user._id);

  // Remove sensitive information from user object
  const userData = {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified
  };

  // Set cookie
  setTokenCookie(res, token);

  // Send response
  res.status(statusCode).json({
    success: true,
    isNewUser,
    token,
    user: userData
  });
};

export default {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
  sendTokenResponse
};