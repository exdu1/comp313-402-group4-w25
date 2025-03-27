// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    // Only required if not using SSO exclusively
    required: function() { return !this.authProvider; },
    select: false, // Don't include password in query results by default
    minlength: [8, 'Password must be at least 8 characters']
  },
  displayName: {
    type: String,
    default: function() {
      // Extract name from email if not provided
      return this.email.split('@')[0];
    }
  },
  // For SSO integration
  authProvider: {
    type: String,
    enum: ['google', 'microsoft', null],
    default: null
  },
  authProviderId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  verificationExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // For GDPR compliance and data anonymization
  isAnonymized: {
    type: Boolean,
    default: false
  },
  anonymizedAt: Date
}, {
  // Enable timestamps for automatic updatedAt field
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate and hash email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to verificationToken field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Anonymize user data (for GDPR compliance)
UserSchema.methods.anonymize = function() {
  // Replace email with a hash
  const emailHash = crypto
    .createHash('sha256')
    .update(this.email)
    .digest('hex');
  
  this.email = `anonymized_${emailHash}@anonymous.com`;
  this.displayName = `Anonymous User`;
  this.password = undefined;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
  this.verificationToken = undefined;
  this.verificationExpire = undefined;
  this.authProviderId = undefined;
  this.isAnonymized = true;
  this.anonymizedAt = Date.now();
  
  return this;
};

const User = mongoose.model('User', UserSchema);
export default User;