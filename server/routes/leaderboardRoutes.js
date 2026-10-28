import express from 'express';
import Citizen from '../models/Citizen.js';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// GET /api/leaderboard: Civic leaderboard of top citizens with most resolved issues
router.get('/', async (req, res) => {
  try {
    // Fetch citizens sorted by resolvedCount descending
    const citizens = await Citizen.find().sort({ resolvedCount: -1, civicPoints: -1 }).limit(50);

    // Also compute community totals
    const totalResolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const totalComplaints = await Complaint.countDocuments();
    const totalCitizens = await Citizen.countDocuments();

    // Map rank and title
    const leaderboard = citizens.map((citizen, index) => {
      const obj = citizen.toJSON();
      let rankBadge = '🎖️';
      if (index === 0) rankBadge = '🥇';
      else if (index === 1) rankBadge = '🥈';
      else if (index === 2) rankBadge = '🥉';

      return {
        ...obj,
        rank: index + 1,
        rankBadge,
      };
    });

    res.json({
      success: true,
      stats: {
        totalResolvedComplaints,
        totalComplaints,
        totalCitizens,
        resolutionRate: totalComplaints > 0 ? Math.round((totalResolvedComplaints / totalComplaints) * 100) : 0,
      },
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
