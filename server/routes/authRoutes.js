import express from 'express';
import Citizen from '../models/Citizen.js';
import Worker from '../models/Worker.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Admin login
    if (role === 'admin' || cleanEmail === 'admin@city.gov.in') {
      if (password !== 'admin123' && password !== 'admin') {
        return res.status(401).json({ success: false, message: 'Invalid Admin password. Use "admin123".' });
      }
      return res.json({
        success: true,
        user: {
          role: 'admin',
          name: 'Chief Municipal Officer',
          email: 'admin@city.gov.in',
          title: 'City Municipal Administrator',
        },
      });
    }

    // 2. Worker login
    if (role === 'worker' || cleanEmail.includes('pwd') || cleanEmail.includes('worker') || cleanEmail.includes('.gov.in')) {
      const worker = await Worker.findOne({ email: cleanEmail });
      if (worker) {
        return res.json({
          success: true,
          user: {
            role: 'worker',
            workerId: worker._id,
            name: worker.name,
            email: worker.email,
            department: worker.department,
            badgeNumber: worker.badgeNumber,
            avatar: worker.avatar,
          },
        });
      }
      // If worker not found by exact email, find first worker or return error
      const anyWorker = await Worker.findOne();
      if (anyWorker) {
        return res.json({
          success: true,
          user: {
            role: 'worker',
            workerId: anyWorker._id,
            name: anyWorker.name,
            email: anyWorker.email,
            department: anyWorker.department,
            badgeNumber: anyWorker.badgeNumber,
            avatar: anyWorker.avatar,
          },
        });
      }
    }

    // 3. Citizen login / registration
    let citizen = await Citizen.findOne({ email: cleanEmail });
    if (!citizen) {
      // Auto-create citizen profile if logging in for first time
      const nameFromEmail = cleanEmail.split('@')[0].replace('.', ' ');
      citizen = await Citizen.create({
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: cleanEmail,
        ward: 'Ward 4 - Green Valley',
        resolvedCount: 0,
        totalReported: 0,
        civicPoints: 50,
        badge: 'Active Citizen 🌱',
      });
    }

    return res.json({
      success: true,
      user: {
        role: 'citizen',
        name: citizen.name,
        email: citizen.email,
        ward: citizen.ward,
        resolvedCount: citizen.resolvedCount,
        civicPoints: citizen.civicPoints,
        badge: citizen.badge,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me - for checking session
router.get('/me', (req, res) => {
  res.json({ success: true, message: 'Session active' });
});

export default router;
