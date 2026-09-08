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

// Known explicit overrides for tricky titles - strictly 100% LeetCode
const TITLE_MAP = {
  "largest element in array": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
  "second largest element in array": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
  "check if array is sorted and rotated": "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/",
  "remove duplicates from sorted array": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
  "rotate array left by 1place": "https://leetcode.com/problems/rotate-array/",
  "rotate array left&right by k places": "https://leetcode.com/problems/rotate-array/",
  "move 0's to end": "https://leetcode.com/problems/move-zeroes/",
  "linear search": "https://leetcode.com/problemset/all/?search=linear+search",
  "union of 2 sorted arrays": "https://leetcode.com/problems/intersection-of-two-arrays/",
  "missing number": "https://leetcode.com/problems/missing-number/",
  "max consecutive 1's": "https://leetcode.com/problems/max-consecutive-ones/",
  "longest subarray with given sum": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "find element present only once": "https://leetcode.com/problems/single-number/",
  "2 sum problem": "https://leetcode.com/problems/two-sum/",
  "sort 0 1 2": "https://leetcode.com/problems/sort-colors/",
  "majority element": "https://leetcode.com/problems/majority-element/",
  "kadane's algorithm": "https://leetcode.com/problems/maximum-subarray/",
  "number of subarray sum equal k": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "stock buy sell": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  "rearange elements by sign": "https://leetcode.com/problems/rearrange-array-elements-by-sign/",
  "next permutation": "https://leetcode.com/problems/next-permutation/",
  "leaders in array": "https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/",
  "longest consecutive subsequence": "https://leetcode.com/problems/longest-consecutive-sequence/",
  "set matrix 0's": "https://leetcode.com/problems/set-matrix-zeroes/",
  "rotate matrix": "https://leetcode.com/problems/rotate-image/",
  "spiral traversal": "https://leetcode.com/problems/spiral-matrix/",
  "pascal triangle": "https://leetcode.com/problems/pascals-triangle/",
  "majority element 2": "https://leetcode.com/problems/majority-element-ii/",
  "3 sum": "https://leetcode.com/problems/3sum/",
  "4 sum": "https://leetcode.com/problems/4sum/",
  "largest subarray with 0sum": "https://leetcode.com/problems/contiguous-array/",
  "subarrays with xor k": "https://leetcode.com/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/",
  "merge overlapping subinterval": "https://leetcode.com/problems/merge-intervals/",
  "merge 2 sorted array without space": "https://leetcode.com/problems/merge-sorted-array/",
  "repeating and missing numbers": "https://leetcode.com/problems/set-mismatch/",
  "count inversions": "https://leetcode.com/problems/global-and-local-inversions/",
  "reverse pairs": "https://leetcode.com/problems/reverse-pairs/",
  "maximum product subarray": "https://leetcode.com/problems/maximum-product-subarray/",
  "longest subarray with sum k containg +ves and -ves": "https://leetcode.com/problems/subarray-sum-equals-k/",
  "koko eating banana": "https://leetcode.com/problems/koko-eating-bananas/",
  "aggresive cows": "https://leetcode.com/problems/magnetic-force-between-two-balls/",
  "book allocation": "https://leetcode.com/problems/split-array-largest-sum/",
  "n meetings in one room": "https://leetcode.com/problems/meeting-rooms/",
  "minimum platforms": "https://leetcode.com/problems/meeting-rooms-ii/",
  "job sequencing problem": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
  "candy": "https://leetcode.com/problems/candy/",
  "rotten oranges": "https://leetcode.com/problems/rotting-oranges/",
  "rat in maze": "https://leetcode.com/problems/unique-paths-iii/",
  "n queens": "https://leetcode.com/problems/n-queens/",
  "m coloring problem": "https://leetcode.com/problemset/all/?search=graph+coloring",
  "sudoku solver": "https://leetcode.com/problems/sudoku-solver/",
  "lru cache": "https://leetcode.com/problems/lru-cache/",
  "lfu cache": "https://leetcode.com/problems/lfu-cache/",
  "trapping rainwater": "https://leetcode.com/problems/trapping-rain-water/",
  "sliding window maximum": "https://leetcode.com/problems/sliding-window-maximum/",
  "celebrity problem": "https://leetcode.com/problems/find-the-celebrity/"
};

function generateLeetCodeUrl(title) {
  const lower = title.toLowerCase().trim();
  
  if (TITLE_MAP[lower]) {
    return TITLE_MAP[lower];
  }

  // Remove parenthesis or extra info e.g. " (atoi)", " - Hard Variant"
  let clean = lower
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/basics|variant|with.*|via.*|using.*|in-place|in o\(1\).*/gi, '')
    .trim();

  // Create standard kebab-case slug
  const slug = clean
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  if (slug.length > 2) {
    return `https://leetcode.com/problems/${slug}/`;
  }

  return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title)}`;
}

function generateArticleUrl(title) {
  return `https://takeuforward.org/?s=${encodeURIComponent(title)}`;
}

async function enrichLinks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const problems = await Problem.find({});
    console.log(`Enriching links for ${problems.length} problems...`);

    const bulkOps = [];

    for (const p of problems) {
      const leetcodeUrl = p.leetcodeUrl || generateLeetCodeUrl(p.title);
      const articleUrl = p.articleUrl || generateArticleUrl(p.title);

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              leetcodeUrl,
              articleUrl
            }
          }
        }
      });
    }

    if (bulkOps.length > 0) {
      const res = await Problem.bulkWrite(bulkOps, { ordered: false });
      console.log(`Updated ${res.modifiedCount} problems with LeetCode and Article links!`);
    }

    // Verify sample
    const sample = await Problem.findOne({ number: 24 }); // 2 sum
    console.log('Sample enriched problem (#24):', {
      title: sample.title,
      leetcodeUrl: sample.leetcodeUrl,
      articleUrl: sample.articleUrl,
      isOriginal: sample.isOriginal
    });

  } catch (err) {
    console.error('Error enriching links:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
}

enrichLinks();
