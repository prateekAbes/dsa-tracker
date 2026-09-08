import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

import Problem from '../models/Problem.js';

// Configure DNS servers fallback for Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if not permitted
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/striver-tracker';

async function findSeedFile() {
  const candidates = [
    process.env.SEED_FILE,
    path.resolve(__dirname, '../data/Striver_A2Z_1000_Master_List_STRIVER_Marked.md'),
    'E:/antigravity/Striver_A2Z_1000_Master_List_STRIVER_Marked.md'
  ].filter(Boolean);

  for (const filePath of candidates) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      // try next
    }
  }
  return null;
}

async function runSeed() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB successfully!`);

    const seedFile = await findSeedFile();
    if (!seedFile) {
      console.error('Could not find Striver markdown file in any known location.');
      process.exit(1);
    }
    console.log(`Reading seed file from: ${seedFile}`);

    let fileContent;
    try {
      fileContent = await fs.readFile(seedFile, 'utf-8');
    } catch (err) {
      console.error(`Error reading seed file at ${seedFile}:`, err.message);
      process.exit(1);
    }

    const lines = fileContent.split('\n');
    let currentTopic = '';
    let currentTopicIndex = -1;
    let currentDifficulty = 'Easy';
    
    const operations = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Parse Topic
      const topicMatch = trimmedLine.match(/^##\s+(\d+)\.\s+(.*)/);
      if (topicMatch) {
        currentTopicIndex = parseInt(topicMatch[1], 10);
        currentTopic = topicMatch[2].trim();
        continue;
      }

      // Parse Difficulty
      const difficultyMatch = trimmedLine.match(/^###\s+(Easy|Medium|Hard)/i);
      if (difficultyMatch) {
        const diffStr = difficultyMatch[1].toLowerCase();
        currentDifficulty = diffStr.charAt(0).toUpperCase() + diffStr.slice(1);
        continue;
      }

      // Parse Problem: - [ ] N. **Title** — ...
      const problemMatch = trimmedLine.match(/^- \[ \] (\d+)\.\s+\*\*(.+?)\*\*/);
      if (problemMatch) {
        const number = parseInt(problemMatch[1], 10);
        const title = problemMatch[2].trim();
        const isStriver = trimmedLine.includes('**STRIVER**');
        const isOriginal = trimmedLine.includes('[Original 369]');

        if (!currentTopic) {
          console.warn(`Warning: Found problem ${number} but no topic is set. Skipping.`);
          continue;
        }

        operations.push({
          updateOne: {
            filter: { number },
            update: {
              $set: {
                title,
                topic: currentTopic,
                topicIndex: currentTopicIndex,
                difficulty: currentDifficulty,
                isStriver,
                isOriginal
              },
              $setOnInsert: {
                status: 'todo',
                notes: '',
                solutionUrl: '',
                completedAt: null
              }
            },
            upsert: true
          }
        });
      }
    }

    console.log(`Executing bulk upsert for ${operations.length} problems...`);
    const result = await Problem.bulkWrite(operations, { ordered: false });

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`- Upserted: ${result.upsertedCount}`);
    console.log(`- Matched:  ${result.matchedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Total in DB: ${await Problem.countDocuments()}`);

  } catch (err) {
    console.error('Fatal error during seed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runSeed();
