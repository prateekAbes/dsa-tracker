import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userCount = await User.countDocuments();
    const user = await User.create({ username, password });
    
    if (userCount === 0) {
      // First user inherits all existing problems (migration)
      await Problem.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
      );
      console.log(`Migrated existing problems to first user: ${username}`);
    } else {
      // For subsequent users, we need to clone the master list.
      // Wait, we can clone from the first user's problems, but reset status, notes, etc.
      // Better: find all problems where userId is the first user (or a known admin), 
      // clone them with new userId, and reset user-specific fields.
      const baseProblems = await Problem.find({ userId: (await User.findOne().sort('createdAt'))._id }).lean();
      
      const newProblems = baseProblems.map(p => {
        delete p._id;
        delete p.__v;
        return {
          ...p,
          userId: user._id,
          status: 'todo',
          notes: '',
          solutionUrl: '',
          solutions: [],
          completedAt: null
        };
      });
      
      await Problem.insertMany(newProblems);
      console.log(`Cloned ${newProblems.length} problems for new user: ${username}`);
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
  });
});

export default router;
