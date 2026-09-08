import express from 'express';
import { protect } from '../middleware/auth.js';
import { cloneProblemsForUser } from '../utils/cloneProblems.js';
import Problem from '../models/Problem.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await cloneProblemsForUser(userId);
    res.json({ success: true, count, message: 'Problems synchronized' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Server error during sync', details: error.message });
  }
});

router.get('/status', protect, async (req, res) => {
  try {
    const count = await Problem.countDocuments({ userId: req.user._id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
