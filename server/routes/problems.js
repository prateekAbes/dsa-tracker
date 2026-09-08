import express from 'express';
import Problem from '../models/Problem.js';
import { cloneProblemsForUser } from '../utils/cloneProblems.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const MASTER_USER_ID = null;

// GET / - List all problems (works for both guests and signed-in users)
router.get('/', async (req, res, next) => {
  try {
    const { topic, difficulty, status, isOriginal, search } = req.query;
    
    let targetUserId = MASTER_USER_ID;

    if (req.user && req.user._id) {
      targetUserId = String(req.user._id);
      const existingCount = await Problem.countDocuments({ userId: targetUserId });
      if (existingCount === 0) {
        await cloneProblemsForUser(targetUserId);
      }
    }

    const query = targetUserId 
      ? { userId: targetUserId } 
      : { $or: [{ userId: null }, { userId: { $exists: false } }] };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (isOriginal !== undefined) query.isOriginal = isOriginal === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    let problems = await Problem.find(query).sort({ number: 1 }).lean();

    // If guest user, show all problems with status 'todo' and empty personal notes/solutions
    if (!req.user) {
      problems = problems.map(p => ({
        ...p,
        status: 'todo',
        notes: '',
        completedAt: null,
        solutions: []
      }));
    }

    res.json(problems);
  } catch (error) {
    next(error);
  }
});

// GET /:number - Get single problem by number
router.get('/:number', async (req, res, next) => {
  try {
    const targetUserId = req.user ? String(req.user._id) : MASTER_USER_ID;
    const problem = await Problem.findOne({ userId: targetUserId, number: Number(req.params.number) }).lean();
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    
    if (!req.user) {
      problem.status = 'todo';
      problem.notes = '';
      problem.completedAt = null;
      problem.solutions = [];
    }

    res.json(problem);
  } catch (error) {
    next(error);
  }
});

// PATCH /bulk/update - Bulk update problems (requires sign in)
router.patch('/bulk/update', protect, async (req, res, next) => {
  try {
    const { numbers, update } = req.body;
    if (!numbers || !Array.isArray(numbers)) {
      return res.status(400).json({ error: 'Missing or invalid numbers array' });
    }

    const validUpdateFields = ['status', 'notes', 'solutionUrl', 'leetcodeUrl', 'tags'];
    let setObj = {};
    
    for (const field of validUpdateFields) {
      if (update[field] !== undefined) {
        setObj[field] = update[field];
      }
    }

    if (setObj.status === 'done') {
      setObj.completedAt = new Date();
    } else if (setObj.status !== undefined) {
      setObj.completedAt = null;
    }

    const result = await Problem.updateMany(
      { userId: req.user._id, number: { $in: numbers } },
      { $set: setObj }
    );

    res.json({ message: 'Bulk update successful', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
});

// POST /reset - Reset all problems (requires sign in)
router.post('/reset', protect, async (req, res, next) => {
  try {
    const result = await Problem.updateMany({ userId: req.user._id }, {
      $set: {
        status: 'todo',
        notes: '',
        solutionUrl: '',
        completedAt: null
      }
    });
    res.json({ message: 'Reset successful', modifiedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
});

// POST / - Create custom problem (requires sign in)
router.post('/', protect, async (req, res, next) => {
  try {
    let { number, title, topic, topicIndex, difficulty, leetcodeUrl, solutionUrl, notes, isOriginal, isStriver } = req.body;
    
    if (!title || !topic) {
      return res.status(400).json({ error: 'Title and topic are required' });
    }

    if (!number) {
      const last = await Problem.findOne({ userId: req.user._id }).sort({ number: -1 });
      number = last ? last.number + 1 : 1;
    }

    const existing = await Problem.findOne({ userId: req.user._id, number });
    if (existing) {
      return res.status(400).json({ error: `Problem with number ${number} already exists` });
    }

    const newProblem = new Problem({
      userId: req.user._id,
      number,
      title,
      topic,
      topicIndex: topicIndex || 1,
      difficulty: difficulty || 'Medium',
      leetcodeUrl: leetcodeUrl || '',
      solutionUrl: solutionUrl || '',
      notes: notes || '',
      isOriginal: !!isOriginal,
      isStriver: isStriver !== undefined ? !!isStriver : false,
      status: 'todo'
    });

    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    next(error);
  }
});

// PATCH /:number - Update single problem (requires sign in)
router.patch('/:number', protect, async (req, res, next) => {
  try {
    const { status, notes, solutionUrl, leetcodeUrl, tags, difficulty, title, topic, topicIndex, isOriginal } = req.body;
    const problem = await Problem.findOne({ userId: req.user._id, number: Number(req.params.number) });
    
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    if (status !== undefined) {
      problem.status = status;
      if (status === 'done') {
        problem.completedAt = new Date();
      } else {
        problem.completedAt = null;
      }
    }
    
    if (notes !== undefined) problem.notes = notes;
    if (solutionUrl !== undefined) problem.solutionUrl = solutionUrl;
    if (leetcodeUrl !== undefined) problem.leetcodeUrl = leetcodeUrl;
    if (tags !== undefined) problem.tags = tags;
    if (difficulty !== undefined) problem.difficulty = difficulty;
    if (title !== undefined) problem.title = title;
    if (topic !== undefined) problem.topic = topic;
    if (topicIndex !== undefined) problem.topicIndex = topicIndex;
    if (isOriginal !== undefined) problem.isOriginal = isOriginal;

    await problem.save();
    res.json(problem);
  } catch (error) {
    next(error);
  }
});

// DELETE /:number - Delete problem (requires sign in)
router.delete('/:number', protect, async (req, res, next) => {
  try {
    const result = await Problem.findOneAndDelete({ userId: req.user._id, number: Number(req.params.number) });
    if (!result) return res.status(404).json({ error: 'Problem not found' });
    res.json({ message: 'Problem deleted successfully', number: req.params.number });
  } catch (error) {
    next(error);
  }
});

// POST /:number/solutions - Add code solution (requires sign in)
router.post('/:number/solutions', protect, async (req, res, next) => {
  try {
    const { name, code, language } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const problem = await Problem.findOne({ userId: req.user._id, number: Number(req.params.number) });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    problem.solutions.push({ name, code, language: language || 'javascript' });
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
});

// DELETE /:number/solutions/:solutionId - Delete code solution (requires sign in)
router.delete('/:number/solutions/:solutionId', protect, async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ userId: req.user._id, number: Number(req.params.number) });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    problem.solutions = problem.solutions.filter(s => s._id.toString() !== req.params.solutionId);
    await problem.save();
    res.json(problem);
  } catch (error) {
    next(error);
  }
});

export default router;
