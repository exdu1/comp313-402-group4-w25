import express from 'express';
import { 
  register, login, logout, 
  getMe, forgotPassword, resetPassword,
  verifyEmail, refreshToken, googleAuth,
  googleCallback 
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/refresh-token', refreshToken);

// SSO routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;