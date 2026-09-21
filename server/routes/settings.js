import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toSafeObject());
  } catch (err) {
    console.error('Failed to get settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/', async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      if (preferences.theme !== undefined) user.preferences.theme = preferences.theme;
      if (preferences.dailyTarget !== undefined) user.preferences.dailyTarget = preferences.dailyTarget;
      if (preferences.weekStart !== undefined) user.preferences.weekStart = preferences.weekStart;
    }

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.delete('/account', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Failed to delete account:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
