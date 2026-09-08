import express from 'express';
import Problem from '../models/Problem.js';
import { cloneProblemsForUser } from '../utils/cloneProblems.js';

const router = express.Router();
const MASTER_FILTER = { $or: [{ userId: null }, { userId: { $exists: false } }] };

async function getStreakCount(userId) {
  if (!userId) return 0;
  const completedProblems = await Problem.find({ userId, completedAt: { $ne: null } })
    .sort({ completedAt: -1 })
    .select('completedAt');

  if (completedProblems.length === 0) return 0;

  const uniqueDates = [...new Set(completedProblems.map(p => 
    p.completedAt.toISOString().split('T')[0]
  ))];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    let prevDate = new Date(uniqueDates[i]);
    let expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    
    if (prevDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// GET / - Overall stats (publicly accessible)
router.get('/', async (req, res, next) => {
  try {
    let userId = req.user ? String(req.user._id) : null;
    
    if (userId) {
      let total = await Problem.countDocuments({ userId });
      if (total === 0) {
        await cloneProblemsForUser(userId);
        total = await Problem.countDocuments({ userId });
      }
      const done = await Problem.countDocuments({ userId, status: 'done' });
      const inProgress = await Problem.countDocuments({ userId, status: 'in-progress' });
      const revision = await Problem.countDocuments({ userId, status: 'revision' });
      const todo = await Problem.countDocuments({ userId, status: 'todo' });

      const difficultyAgg = await Problem.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$difficulty',
            total: { $sum: 1 },
            done: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
            }
          }
        }
      ]);

      const byDifficulty = {
        Easy: { total: 0, done: 0, completed: 0 },
        Medium: { total: 0, done: 0, completed: 0 },
        Hard: { total: 0, done: 0, completed: 0 }
      };

      difficultyAgg.forEach(d => {
        if (byDifficulty[d._id]) {
          byDifficulty[d._id] = { total: d.total, done: d.done, completed: d.done };
        }
      });

      const completionPercentage = total > 0 ? ((done / total) * 100).toFixed(2) : 0;
      const streak = await getStreakCount(userId);

      return res.json({
        total, 
        done, 
        totalCompleted: done,
        inProgress, 
        revision, 
        todo,
        byDifficulty,
        easy: byDifficulty.Easy,
        medium: byDifficulty.Medium,
        hard: byDifficulty.Hard,
        streak,
        currentStreak: streak,
        completionPercentage: parseFloat(completionPercentage)
      });
    }

    // Guest view: Show total problem curriculum with 0 completed
    const total = await Problem.countDocuments(MASTER_FILTER);
    const difficultyAgg = await Problem.aggregate([
      { $match: MASTER_FILTER },
      {
        $group: {
          _id: '$difficulty',
          total: { $sum: 1 }
        }
      }
    ]);

    const byDifficulty = {
      Easy: { total: 0, done: 0, completed: 0 },
      Medium: { total: 0, done: 0, completed: 0 },
      Hard: { total: 0, done: 0, completed: 0 }
    };

    difficultyAgg.forEach(d => {
      if (byDifficulty[d._id]) {
        byDifficulty[d._id] = { total: d.total, done: 0, completed: 0 };
      }
    });

    res.json({
      total,
      done: 0,
      totalCompleted: 0,
      inProgress: 0,
      revision: 0,
      todo: total,
      byDifficulty,
      easy: byDifficulty.Easy,
      medium: byDifficulty.Medium,
      hard: byDifficulty.Hard,
      streak: 0,
      currentStreak: 0,
      completionPercentage: 0
    });
  } catch (error) {
    next(error);
  }
});

// GET /topics - Per-topic stats (publicly accessible)
router.get('/topics', async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const matchQuery = req.user ? { userId: String(req.user._id) } : MASTER_FILTER;

    const topicsStats = await Problem.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { topic: '$topic', topicIndex: '$topicIndex' },
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          revision: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
          easyTotal: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
          easyDone: { $sum: { $cond: [{ $and: [{ $eq: ['$difficulty', 'Easy'] }, { $eq: ['$status', 'done'] }] }, 1, 0] } },
          mediumTotal: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
          mediumDone: { $sum: { $cond: [{ $and: [{ $eq: ['$difficulty', 'Medium'] }, { $eq: ['$status', 'done'] }] }, 1, 0] } },
          hardTotal: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } },
          hardDone: { $sum: { $cond: [{ $and: [{ $eq: ['$difficulty', 'Hard'] }, { $eq: ['$status', 'done'] }] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          topic: '$_id.topic',
          topicIndex: '$_id.topicIndex',
          total: 1,
          done: isGuest ? 0 : '$done',
          completed: isGuest ? 0 : '$done',
          inProgress: isGuest ? 0 : '$inProgress',
          todo: isGuest ? '$total' : '$todo',
          revision: isGuest ? 0 : '$revision',
          easy: {
            total: '$easyTotal',
            done: isGuest ? 0 : '$easyDone',
            completed: isGuest ? 0 : '$easyDone'
          },
          medium: {
            total: '$mediumTotal',
            done: isGuest ? 0 : '$mediumDone',
            completed: isGuest ? 0 : '$mediumDone'
          },
          hard: {
            total: '$hardTotal',
            done: isGuest ? 0 : '$hardDone',
            completed: isGuest ? 0 : '$hardDone'
          },
          completionPercentage: isGuest ? 0 : {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$done', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { topicIndex: 1 } }
    ]);

    res.json(topicsStats);
  } catch (error) {
    next(error);
  }
});

// GET /streak - Daily completion streak
router.get('/streak', async (req, res, next) => {
  try {
    const streak = req.user ? await getStreakCount(req.user._id) : 0;
    res.json({ currentStreak: streak });
  } catch (error) {
    next(error);
  }
});

// GET /original-369 - Stats specifically for Original 369 Sheet (publicly accessible)
router.get('/original-369', async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const filter = req.user 
      ? { userId: String(req.user._id), isOriginal: true } 
      : { ...MASTER_FILTER, isOriginal: true };
    const total = await Problem.countDocuments(filter);
    const done = isGuest ? 0 : await Problem.countDocuments({ ...filter, status: 'done' });
    const inProgress = isGuest ? 0 : await Problem.countDocuments({ ...filter, status: 'in-progress' });
    const revision = isGuest ? 0 : await Problem.countDocuments({ ...filter, status: 'revision' });
    const todo = isGuest ? total : await Problem.countDocuments({ ...filter, status: 'todo' });

    const completionPercentage = total > 0 ? ((done / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      done,
      totalCompleted: done,
      inProgress,
      revision,
      todo,
      completionPercentage: parseFloat(completionPercentage)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
