import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
import Problem from '../models/Problem.js';

if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {}
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pk4081988_db_user:Q6WFRHGqFQ1u8YS4@cluster0.zqplvex.mongodb.net/striver-tracker?retryWrites=true&w=majority&appName=Cluster0';

const EXTRA_TOP_LEETCODE = [
  {
    title: "3Sum Closest",
    topic: "Arrays",
    topicIndex: 1,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/3sum-closest/",
    isOriginal: false
  },
  {
    title: "Subarray Product Less Than K",
    topic: "Sliding Window",
    topicIndex: 8,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/subarray-product-less-than-k/",
    isOriginal: false
  },
  {
    title: "Search in Rotated Sorted Array II",
    topic: "Binary Search",
    topicIndex: 2,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    isOriginal: false
  },
  {
    title: "Find Minimum in Rotated Sorted Array II",
    topic: "Binary Search",
    topicIndex: 2,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/",
    isOriginal: false
  },
  {
    title: "Valid Palindrome II",
    topic: "Strings",
    topicIndex: 3,
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome-ii/",
    isOriginal: false
  },
  {
    title: "Palindromic Substrings",
    topic: "Strings",
    topicIndex: 3,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/palindromic-substrings/",
    isOriginal: false
  },
  {
    title: "Daily Temperatures",
    topic: "Stack and Queues",
    topicIndex: 7,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
    isOriginal: false
  },
  {
    title: "Car Fleet",
    topic: "Stack and Queues",
    topicIndex: 7,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/car-fleet/",
    isOriginal: false
  },
  {
    title: "Task Scheduler",
    topic: "Heaps",
    topicIndex: 9,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
    isOriginal: false
  },
  {
    title: "Partition Labels",
    topic: "Greedy Approach",
    topicIndex: 10,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/partition-labels/",
    isOriginal: false
  },
  {
    title: "Gas Station",
    topic: "Greedy Approach",
    topicIndex: 10,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/gas-station/",
    isOriginal: false
  },
  {
    title: "Binary Tree Maximum Path Sum",
    topic: "Binary Trees",
    topicIndex: 11,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    isOriginal: false
  },
  {
    title: "Validate Binary Search Tree",
    topic: "Binary Search Trees",
    topicIndex: 12,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    isOriginal: false
  },
  {
    title: "Clone Graph",
    topic: "Graphs",
    topicIndex: 13,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
    isOriginal: false
  },
  {
    title: "Coin Change",
    topic: "Dynamic Programming",
    topicIndex: 14,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/coin-change/",
    isOriginal: false
  },
  {
    title: "Word Break",
    topic: "Dynamic Programming",
    topicIndex: 14,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/word-break/",
    isOriginal: false
  },
  {
    title: "Replace Words",
    topic: "Tries",
    topicIndex: 15,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/replace-words/",
    isOriginal: false
  },
  {
    title: "Map Sum Pairs",
    topic: "Tries",
    topicIndex: 15,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/map-sum-pairs/",
    isOriginal: false
  }
];

async function addExtraQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let last = await Problem.findOne().sort({ number: -1 });
    let nextNum = last ? last.number + 1 : 1002;
    let added = 0;

    for (const q of EXTRA_TOP_LEETCODE) {
      const exists = await Problem.findOne({ title: { $regex: new RegExp(`^${q.title}$`, 'i') } });
      if (!exists) {
        await Problem.create({
          number: nextNum++,
          title: q.title,
          topic: q.topic,
          topicIndex: q.topicIndex,
          difficulty: q.difficulty,
          leetcodeUrl: q.leetcodeUrl,
          articleUrl: `https://takeuforward.org/?s=${encodeURIComponent(q.title)}`,
          isOriginal: q.isOriginal,
          isStriver: false,
          status: 'todo'
        });
        console.log(`+ Added #${nextNum - 1}: ${q.title} (${q.topic}) -> ${q.leetcodeUrl}`);
        added++;
      } else {
        console.log(`~ Already in DB: ${q.title}`);
      }
    }

    const total = await Problem.countDocuments();
    console.log(`\nAdded ${added} extra LeetCode problems! Total in DB now: ${total}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

addExtraQuestions();
