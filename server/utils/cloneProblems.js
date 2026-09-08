import Problem from '../models/Problem.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function cloneProblemsForUser(userId) {
  if (!userId) return 0;
  
  try {
    const existing = await Problem.countDocuments({ userId: String(userId) });
    if (existing > 0) return existing;

    console.log(`User ${userId} has 0 problems. Starting clone...`);

    // 1. First priority: Find unassigned master problems (userId: null)
    let baseProblems = await Problem.find({ 
      $or: [{ userId: null }, { userId: { $exists: false } }] 
    }).lean();

    // 2. Fallback: Find problems from any existing user
    if (!baseProblems || baseProblems.length === 0) {
      const sample = await Problem.findOne({ userId: { $ne: String(userId) } });
      if (sample && sample.userId) {
        baseProblems = await Problem.find({ userId: sample.userId }).lean();
      }
    }

    // 3. Fallback: Load from master_problems.json directly
    if (!baseProblems || baseProblems.length === 0) {
      try {
        const jsonPath = path.resolve(__dirname, '../data/master_problems.json');
        const raw = await fs.readFile(jsonPath, 'utf8');
        baseProblems = JSON.parse(raw);
        console.log(`Loaded ${baseProblems.length} problems from master_problems.json fallback.`);
      } catch (fileErr) {
        console.warn('Could not read master_problems.json fallback:', fileErr.message);
      }
    }

    if (!baseProblems || baseProblems.length === 0) {
      console.warn(`No master problems found to clone for user ${userId}`);
      return 0;
    }

    const docs = baseProblems.map(p => {
      const { _id, __v, createdAt, updatedAt, ...rest } = p;
      return {
        ...rest,
        userId: String(userId),
        status: 'todo',
        notes: '',
        solutionUrl: p.solutionUrl || '',
        leetcodeUrl: p.leetcodeUrl || '',
        solutions: [],
        completedAt: null
      };
    });

    try {
      await Problem.insertMany(docs, { ordered: false });
    } catch (insertErr) {
      console.warn('Note during insertMany:', insertErr.message);
    }

    const finalCount = await Problem.countDocuments({ userId: String(userId) });
    console.log(`Cloned problems for user ${userId}. Total in DB for user: ${finalCount}`);
    return finalCount;
  } catch (err) {
    console.error('Fatal error in cloneProblemsForUser:', err);
    return 0;
  }
}
