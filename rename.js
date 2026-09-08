import fs from 'fs';
import path from 'path';

const searchReplace = [
  ['Striver A2Z DSA Tracker', 'MyDSA Tracker'],
  ['Striver A2Z Tracker', 'MyDSA Tracker'],
  ['Striver Tracker', 'MyDSA Tracker'],
];

const filesToUpdate = [
  'client/index.html',
  'client/src/components/Layout.jsx',
  'client/src/pages/Dashboard.jsx',
  'README.md'
];

filesToUpdate.forEach(file => {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    searchReplace.forEach(([search, replace]) => {
      content = content.replaceAll(search, replace);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
