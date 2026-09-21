import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();


function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    secret,
    { expiresIn: '30d' }
  );
}
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || typeof email !== 'string' || !email.trim()) {
      const msg = 'Email is required';
      return res.status(400).json({ error: msg, message: msg });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const msg = 'Please provide a valid email address';
      return res.status(400).json({ error: msg, message: msg });
    }
    if (!password || typeof password !== 'string') {
      const msg = 'Password is required';
      return res.status(400).json({ error: msg, message: msg });
    }

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters';
      return res.status(400).json({ error: msg, message: msg });
    }
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      const msg = 'An account with this email already exists';
      return res.status(409).json({ error: msg, message: msg });
    }
    const resolvedName =
      name && typeof name === 'string' && name.trim()
        ? name.trim()
        : trimmedEmail.split('@')[0];
    const newUser = new User({
      email: trimmedEmail,
      password,
      name: resolvedName,
    });

    await newUser.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.toSafeObject(),
    });
  } catch (error) {
    if (error.code === 11000) {
      const msg = 'An account with this email already exists';
      return res.status(409).json({ error: msg, message: msg });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]?.message || 'Validation error';
      return res.status(400).json({ error: firstError, message: firstError });
    }

    console.error('Registration error:', error);
    const msg = 'Server error during registration';
    return res.status(500).json({ error: msg, message: msg });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !email.trim()) {
      const msg = 'Email is required';
      return res.status(400).json({ error: msg, message: msg });
    }

    if (!password || typeof password !== 'string') {
      const msg = 'Password is required';
      return res.status(400).json({ error: msg, message: msg });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      const msg = 'Invalid email or password';
      return res.status(401).json({ error: msg, message: msg });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const msg = 'Invalid email or password';
      return res.status(401).json({ error: msg, message: msg });
    }
    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    const msg = 'Server error during login';
    return res.status(500).json({ error: msg, message: msg });
  }
});

export default router;
