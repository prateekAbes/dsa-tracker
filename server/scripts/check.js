import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://pk4081988_db_user:Q6WFRHGqFQ1u8YS4@cluster0.zqplvex.mongodb.net/striver-tracker?appName=Cluster0';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in striver-tracker:', collections.map(c => c.name));
    const problems = await mongoose.connection.db.collection('problems').countDocuments();
    console.log('Problems count:', problems);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
check();
