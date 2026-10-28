import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import complaintRoutes from './routes/complaintRoutes.js';
import wallOfShameRoutes from './routes/wallOfShameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpulse';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static serving for uploaded photos & videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/wall-of-shame', wallOfShameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'CivicPulse Urban Management API',
  });
});

// Admin re-seed utility endpoint
app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset and seeded with initial demo data.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log(`Connected to MongoDB successfully at: ${MONGODB_URI}`);
    // Auto-seed if database is empty
    await seedDatabase(false);

    app.listen(PORT, () => {
      console.log(`CivicPulse API Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
