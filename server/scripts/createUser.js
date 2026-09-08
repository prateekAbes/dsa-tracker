import mongoose from 'mongoose';
import User from '../models/User.js';
import Problem from '../models/Problem.js';

const MONGO_URI = 'mongodb+srv://pk4081988_db_user:Q6WFRHGqFQ1u8YS4@cluster0.zqplvex.mongodb.net/striver-tracker?appName=Cluster0';

async function createUser() {
  await mongoose.connect(MONGO_URI);
  
  const existingUser = await User.findOne({ username: 'admin' });
  if (existingUser) {
    console.log('Admin user already exists');
    await mongoose.disconnect();
    return;
  }

  const user = await User.create({ username: 'admin', password: 'password123' });
  console.log('User created:', user.username);
  
  const result = await Problem.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: user._id } }
  );
  console.log(`Migrated ${result.modifiedCount} problems to admin user`);

  await mongoose.disconnect();
}
createUser();
