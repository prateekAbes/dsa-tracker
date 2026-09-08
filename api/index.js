import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// DNS servers fallback for Atlas SRV resolution on Windows
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if not permitted
  }
}

import problemRoutes from '../server/routes/problems.js';
import statsRoutes from '../server/routes/stats.js';

const app = express();

app.use(cors());
app.use(express.json());

// Global connection cache across serverless invocations
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://pk4081988_db_user:Q6WFRHGqFQ1u8YS4@cluster0.zqplvex.mongodb.net/striver-tracker?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 15000,
  });
  isConnected = true;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in serverless function:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.use('/api/problems', problemRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
