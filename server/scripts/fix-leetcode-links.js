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

// Mapping of problems that are typically on GFG / CodingNinjas to their exact LeetCode equivalent or direct search
const LEETCODE_CANONICAL_MAP = {
  "largest element in array": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
  "second largest element in array": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
  "linear search": "https://leetcode.com/problemset/all/?search=linear+search",
  "union of 2 sorted arrays": "https://leetcode.com/problems/intersection-of-two-arrays/",
  "longest subarray with given sum": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "longest subarray with sum k containg +ves and -ves": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "largest subarray with 0sum": "https://leetcode.com/problems/contiguous-array/",
  "leaders in array": "https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/",
  "repeating and missing numbers": "https://leetcode.com/problems/set-mismatch/",
  "count inversions": "https://leetcode.com/problems/global-and-local-inversions/",
  "subarrays with xor k": "https://leetcode.com/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/",
  "aggresive cows": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
  "book allocation": "https://leetcode.com/problems/split-array-largest-sum/",
  "n meetings in one room": "https://leetcode.com/problems/meeting-rooms/",
  "minimum platforms": "https://leetcode.com/problems/meeting-rooms-ii/",
  "job sequencing problem": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
  "rat in maze": "https://leetcode.com/problems/unique-paths-iii/",
  "m coloring problem": "https://leetcode.com/problemset/all/?search=graph+coloring",
  "celebrity problem": "https://leetcode.com/problems/find-the-celebrity/"
};

async function checkAndFixLinks() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const problems = await Problem.find({});
    console.log(`Checking ${problems.length} problems...`);

    const bulkOps = [];
    let fixedCount = 0;

    for (const p of problems) {
      let url = p.leetcodeUrl || '';
      const lowerTitle = p.title.toLowerCase().trim();

      // Check if it matches our canonical LeetCode map
      if (LEETCODE_CANONICAL_MAP[lowerTitle]) {
        url = LEETCODE_CANONICAL_MAP[lowerTitle];
        fixedCount++;
      } else if (!url || !url.includes('leetcode.com')) {
        // If it was pointing to geeksforgeeks, spoj, interviewbit, codingninjas, or empty
        // Clean title to form a clean LeetCode problem search or direct slug
        const cleanSlug = lowerTitle
          .replace(/\(.*?\)/g, '')
          .replace(/\[.*?\]/g, '')
          .replace(/basics|variant|with.*|via.*|using.*|in-place|in o\(1\).*/gi, '')
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        if (cleanSlug.length > 3) {
          url = `https://leetcode.com/problems/${cleanSlug}/`;
        } else {
          url = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title)}`;
        }
        fixedCount++;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { leetcodeUrl: url } }
        }
      });
    }

    if (bulkOps.length > 0) {
      await Problem.bulkWrite(bulkOps, { ordered: false });
      console.log(`Successfully updated ${fixedCount} links to 100% LeetCode!`);
    }

    // Verify first 5
    const sample = await Problem.find({}).sort({ number: 1 }).limit(5);
    sample.forEach(s => console.log(`#${s.number} ${s.title} -> ${s.leetcodeUrl}`));

    // Remove test problem #1002 if present
    await Problem.deleteOne({ number: 1002 });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAndFixLinks();
