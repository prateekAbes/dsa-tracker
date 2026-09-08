import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Problem from '../models/Problem.js';
import dns from 'dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/striver-tracker';

async function getLeetCodeQuestions(skip = 0, limit = 100) {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
          frontendQuestionId: questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
            slug
          }
        }
      }
    }
  `;

  const variables = { categorySlug: "", skip, limit, filters: {} };

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  return data.data.problemsetQuestionList.questions;
}

async function addMoreQuestions() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const firstUser = await User.findOne().sort('createdAt');
  
  let arraysCount = 0;
  let otherCount = 0;
  
  const existingNumbers = new Set((await Problem.find({ userId: firstUser._id })).map(p => p.number));
  let lastProblemNumber = existingNumbers.size > 0 ? Math.max(...existingNumbers) : 1000;
  
  const newProblems = [];

  for (let skip = 0; skip < 2000; skip += 100) {
    if (arraysCount >= 200 && otherCount >= 500) break;
    console.log(`Fetching from ${skip}...`);
    const questions = await getLeetCodeQuestions(skip, 100);
    if (!questions || questions.length === 0) break;

    for (const q of questions) {
      if (arraysCount >= 200 && otherCount >= 500) break;

      const tags = q.topicTags.map(t => t.name);
      const isArray = tags.includes('Array');
      
      let topicName = '';
      let topicIndex = 17;

      if (isArray && arraysCount < 200) {
        topicName = 'Extra Arrays';
        topicIndex = 17;
        arraysCount++;
      } else if (!isArray && otherCount < 500) {
        topicName = 'Extra Practice: ' + (tags[0] || 'Mixed');
        topicIndex = 18; 
        otherCount++;
      } else {
        continue;
      }

      lastProblemNumber++;

      newProblems.push({
        userId: firstUser._id,
        number: lastProblemNumber,
        title: q.title,
        topic: topicName,
        topicIndex: topicIndex,
        difficulty: q.difficulty,
        isOriginal: false,
        isStriver: false,
        status: 'todo',
        notes: '',
        solutionUrl: '',
        leetcodeUrl: `https://leetcode.com/problems/${q.titleSlug}/`,
        tags: tags,
        completedAt: null
      });
    }
  }

  const allUsers = await User.find();
  let insertCount = 0;
  for (const user of allUsers) {
    const userProblems = newProblems.map(p => ({ ...p, userId: user._id }));
    await Problem.insertMany(userProblems);
    insertCount += userProblems.length;
  }

  console.log(`Inserted ${insertCount} problems across ${allUsers.length} users.`);
  await mongoose.disconnect();
}

addMoreQuestions();
