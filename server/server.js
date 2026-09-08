import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import dns from 'dns';
import { clerkMiddleware } from '@clerk/express';

import problemRoutes from './routes/problems.js';
import statsRoutes from './routes/stats.js';
import syncRoutes from './routes/sync.js';
import { protect, optionalAuth } from './middleware/auth.js';

dotenv.config();

// DNS servers fallback for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if not permitted
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pk4081988_db_user:4IRrBrCSklOwECHK@cluster0.uev1bct.mongodb.net/dsa-tracker?appName=Cluster0';

// Global CORS - allow any origin for API with full headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Clerk middleware with fallback credentials
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || 'pk_test_ZnVubnktY29yZ2ktNjE1OC5jbGVyay5hY2NvdW50cy5kZXYk',
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_bE9RVeeY4e5Cgr5gzUIfMqlyapS0VHpGNTQGSJBGVq'
}));

// MongoDB cached connection for serverless
let cachedPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    }).then(() => {
      console.log('Connected to MongoDB Atlas');
      return mongoose.connection;
    }).catch(err => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  return cachedPromise;
};

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection error', details: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dbState: mongoose.connection.readyState,
    time: new Date().toISOString() 
  });
});

// Routes
app.use('/api/sync', protect, syncRoutes);
app.use('/api/problems', optionalAuth, problemRoutes);
app.use('/api/stats', optionalAuth, statsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start local listener if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(console.error);
}

export default app;
