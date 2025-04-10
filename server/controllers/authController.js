// controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    return res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch(error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ success: true, token, message: 'Signed in successfully.' });
  } catch(error) {
    console.error('Signin error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
