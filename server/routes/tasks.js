import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

// ── GET /api/tasks?from=YYYY-MM-DD&to=YYYY-MM-DD ────────────────────
// Returns all tasks for the authenticated user within a date range.
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: 'Both "from" and "to" query params are required (YYYY-MM-DD)',
      });
    }

    const tasks = await Task.find({
      userId: req.userId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, order: 1, createdAt: 1 })
      .lean();

    return res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// ── POST /api/tasks ──────────────────────────────────────────────────
// Create a new task.
router.post('/', async (req, res) => {
  try {
    const { title, date, completed, order } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: 'title and date are required',
      });
    }

    // Count existing tasks for this user + date to auto-set order
    const existingCount = await Task.countDocuments({
      userId: req.userId,
      date,
    });

    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      date,
      completed: completed || false,
      order: order ?? existingCount,
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error('POST /tasks error:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    return res.status(500).json({ message: 'Failed to create task' });
  }
});

// ── PATCH /api/tasks/:id ─────────────────────────────────────────────
// Update a task (toggle completed, rename, reorder).
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    // Only allow specific fields to be updated
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.completed !== undefined) updates.completed = req.body.completed;
    if (req.body.order !== undefined) updates.order = req.body.order;
    if (req.body.date !== undefined) updates.date = req.body.date;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (err) {
    console.error('PATCH /tasks/:id error:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    return res.status(500).json({ message: 'Failed to update task' });
  }
});

// ── DELETE /api/tasks/:id ────────────────────────────────────────────
// Delete a task.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted', id });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    return res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;
