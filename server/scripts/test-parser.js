import fs from 'fs';

const SEED_FILE = 'E:/antigravity/Striver_A2Z_1000_Master_List_STRIVER_Marked.md';

const fileContent = fs.readFileSync(SEED_FILE, 'utf-8');
const lines = fileContent.split('\n');

let currentTopic = '';
let currentTopicIndex = -1;
let currentDifficulty = 'Easy';

const problems = [];
let errorCount = 0;

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
      console.warn(`Warning: Found problem ${number} but no topic is set.`);
      errorCount++;
      continue;
    }

    problems.push({
      number,
      title,
      topic: currentTopic,
      topicIndex: currentTopicIndex,
      difficulty: currentDifficulty,
      isStriver,
      isOriginal
    });
  }
}

console.log(`Parsed total problems: ${problems.length}`);
console.log(`First problem:`, problems[0]);
console.log(`Last problem:`, problems[problems.length - 1]);
console.log(`Errors: ${errorCount}`);

const byTopic = {};
problems.forEach(p => {
  byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
});
console.log(`Topics count: ${Object.keys(byTopic).length}`);
console.log(byTopic);
