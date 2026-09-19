import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ── POST /api/auth/register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    // Validate email presence
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

    // Validate password presence and length
    if (!password || typeof password !== 'string') {
      const msg = 'Password is required';
      return res.status(400).json({ error: msg, message: msg });
    }

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters';
      return res.status(400).json({ error: msg, message: msg });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      const msg = 'An account with this email already exists';
      return res.status(409).json({ error: msg, message: msg });
    }

    // Set name from payload or derive from email
    const resolvedName =
      name && typeof name === 'string' && name.trim()
        ? name.trim()
        : trimmedEmail.split('@')[0];

    // Create user — pre-save hook handles bcrypt hashing
    const newUser = new User({
      email: trimmedEmail,
      password,
      name: resolvedName,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully',
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

export default router;
