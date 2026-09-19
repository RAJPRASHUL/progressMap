import { Router } from 'express';
import Note from '../models/Note.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All note routes require authentication
router.use(requireAuth);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ── GET /api/notes?from=YYYY-MM-DD&to=YYYY-MM-DD ─────────────────────
// Returns notes for date range.
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: 'Both "from" and "to" query params are required (YYYY-MM-DD)',
      });
    }

    const notes = await Note.find({
      userId: req.userId,
      date: { $gte: from, $lte: to },
    }).lean();

    return res.json(notes);
  } catch (err) {
    console.error('GET /notes range error:', err);
    return res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// ── GET /api/notes/:date ─────────────────────────────────────────────
// Retrieve a single day's note.
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({ message: 'Invalid date format, expected YYYY-MM-DD' });
    }

    const note = await Note.findOne({
      userId: req.userId,
      date,
    }).lean();

    return res.json({
      date,
      text: note ? note.text : '',
    });
  } catch (err) {
    console.error('GET /notes/:date error:', err);
    return res.status(500).json({ message: 'Failed to fetch note' });
  }
});

// ── PUT /api/notes/:date ─────────────────────────────────────────────
// Create or update a note for a given date (upsert).
router.put('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { text } = req.body;

    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({ message: 'Invalid date format, expected YYYY-MM-DD' });
    }

    const noteText = typeof text === 'string' ? text.trim() : '';

    const note = await Note.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: { text: noteText } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      date: note.date,
      text: note.text,
      updatedAt: note.updatedAt,
    });
  } catch (err) {
    console.error('PUT /notes/:date error:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    return res.status(500).json({ message: 'Failed to save note' });
  }
});

export default router;
