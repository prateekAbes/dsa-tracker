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

const CURATED_ADDITIONS = [
  {
    title: "Encode and Decode Strings",
    topic: "Strings",
    topicIndex: 3,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/encode-and-decode-strings/",
    articleUrl: "https://takeuforward.org/?s=encode+and+decode+strings",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Minimum Window Substring",
    topic: "Sliding Window",
    topicIndex: 8,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/",
    articleUrl: "https://takeuforward.org/?s=minimum+window+substring",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Pacific Atlantic Water Flow",
    topic: "Graphs",
    topicIndex: 13,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    articleUrl: "https://takeuforward.org/?s=pacific+atlantic+water+flow",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Design Add and Search Words Data Structure",
    topic: "Tries",
    topicIndex: 15,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    articleUrl: "https://takeuforward.org/?s=design+add+and+search+words",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Word Search II",
    topic: "Tries",
    topicIndex: 15,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/word-search-ii/",
    articleUrl: "https://takeuforward.org/?s=word+search+ii",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Maximum Frequency Stack",
    topic: "Stack and Queues",
    topicIndex: 7,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/maximum-frequency-stack/",
    articleUrl: "https://takeuforward.org/?s=maximum+frequency+stack",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Course Schedule III",
    topic: "Greedy Approach",
    topicIndex: 10,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/course-schedule-iii/",
    articleUrl: "https://takeuforward.org/?s=course+schedule+iii",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Burst Balloons",
    topic: "Dynamic Programming",
    topicIndex: 14,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/burst-balloons/",
    articleUrl: "https://takeuforward.org/?s=burst+balloons",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Russian Doll Envelopes",
    topic: "Dynamic Programming",
    topicIndex: 14,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/russian-doll-envelopes/",
    articleUrl: "https://takeuforward.org/?s=russian+doll+envelopes",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Frog Jump",
    topic: "Dynamic Programming",
    topicIndex: 14,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/frog-jump/",
    articleUrl: "https://takeuforward.org/?s=frog+jump",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Reconstruct Itinerary",
    topic: "Graphs",
    topicIndex: 13,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/reconstruct-itinerary/",
    articleUrl: "https://takeuforward.org/?s=reconstruct+itinerary",
    isOriginal: false,
    isStriver: false
  },
  {
    title: "Alien Dictionary",
    topic: "Graphs",
    topicIndex: 13,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/alien-dictionary/",
    articleUrl: "https://takeuforward.org/?s=alien+dictionary",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Find Median from Data Stream",
    topic: "Heaps",
    topicIndex: 9,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
    articleUrl: "https://takeuforward.org/?s=find+median+from+data+stream",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    topic: "Binary Trees",
    topicIndex: 11,
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    articleUrl: "https://takeuforward.org/?s=serialize+and+deserialize+binary+tree",
    isOriginal: false,
    isStriver: true
  },
  {
    title: "Kth Smallest Element in a BST",
    topic: "Binary Search Trees",
    topicIndex: 12,
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    articleUrl: "https://takeuforward.org/?s=kth+smallest+element+in+a+bst",
    isOriginal: false,
    isStriver: true
  }
];

async function addCuratedQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    let lastProblem = await Problem.findOne().sort({ number: -1 });
    let nextNumber = lastProblem ? lastProblem.number + 1 : 1001;

    let addedCount = 0;

    for (const item of CURATED_ADDITIONS) {
      const exists = await Problem.findOne({ title: { $regex: new RegExp(`^${item.title}$`, 'i') } });
      if (!exists) {
        await Problem.create({
          number: nextNumber++,
          title: item.title,
          topic: item.topic,
          topicIndex: item.topicIndex,
          difficulty: item.difficulty,
          leetcodeUrl: item.leetcodeUrl,
          articleUrl: item.articleUrl,
          isOriginal: item.isOriginal,
          isStriver: item.isStriver,
          status: 'todo',
          notes: '',
          solutionUrl: ''
        });
        addedCount++;
        console.log(`+ Added #${nextNumber - 1}: ${item.title} (${item.topic} - ${item.difficulty})`);
      } else {
        console.log(`~ Already present: ${item.title}`);
      }
    }

    const totalNow = await Problem.countDocuments();
    console.log(`\n🎉 Finished adding curated questions!`);
    console.log(`- New added: ${addedCount}`);
    console.log(`- Total problems now in DB: ${totalNow}`);

  } catch (err) {
    console.error('Error adding curated questions:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

addCuratedQuestions();
