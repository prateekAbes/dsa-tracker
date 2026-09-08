import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = 'mongodb+srv://pk4081988_db_user:Q6WFRHGqFQ1u8YS4@cluster0.zqplvex.mongodb.net/striver-tracker?appName=Cluster0';

async function backup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.db.collection('problems');
    const problems = await collection.find({}).toArray();

    const backupPath = path.resolve('mongo_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(problems, null, 2));

    console.log(`Backup completed. ${problems.length} problems saved to ${backupPath}`);
  } catch (err) {
    console.error('Backup failed:', err);
  } finally {
    mongoose.disconnect();
  }
}

backup();
