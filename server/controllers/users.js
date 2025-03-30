// server/controllers/users.js
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import { encrypt } from '../services/encryptionService.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  // If route is /me, use authenticated user's ID
  const userId = req.originalUrl.includes('/me') ? req.user.id : req.params.id;
  
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // Only return safe user data
  const userData = {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    role: user.role,
    lastLogin: user.lastLogin
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  // If route is /me, use authenticated user's ID
  const userId = req.originalUrl.includes('/me') ? req.user.id : req.params.id;
  
  // For normal users, only allow updating certain fields
  let fieldsToUpdate = {};
  
  if (req.user.role === 'admin' || userId === req.user.id) {
    const { displayName, email } = req.body;
    
    if (displayName) fieldsToUpdate.displayName = displayName;
    
    // Email change requires verification
    if (email && email !== req.user.email) {
      // Generate verification token for new email
      const verificationToken = crypto.randomBytes(20).toString('hex');
      fieldsToUpdate.newEmail = email;
      fieldsToUpdate.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      fieldsToUpdate.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
      
      // Send verification email
      try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email-change/${verificationToken}`;
        const message = `Please verify your new email by clicking on the link: ${verificationUrl}`;
        
        await sendEmail({
          email: email,
          subject: 'Email Change Verification',
          message
        });
      } catch (err) {
        return next(new ErrorResponse('Email verification could not be sent', 500));
      }
    }
  }
  
  // Admin can update additional fields
  if (req.user.role === 'admin' && userId !== req.user.id) {
    const { role, isActive } = req.body;
    if (role) fieldsToUpdate.role = role;
    if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
  }
  
  if (Object.keys(fieldsToUpdate).length === 0) {
    return next(new ErrorResponse('No valid fields to update', 400));
  }
  
  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // Return safe user data
  const userData = {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    role: user.role,
    lastLogin: user.lastLogin
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  // If route is /me, use authenticated user's ID
  const userId = req.originalUrl.includes('/me') ? req.user.id : req.params.id;
  
  // Prevent admin from deleting themselves
  if (req.user.role === 'admin' && userId === req.user.id) {
    return next(new ErrorResponse('Admin cannot delete their own account', 400));
  }
  
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // For GDPR compliance, anonymize user data rather than deleting
  user.anonymize();
  await user.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});