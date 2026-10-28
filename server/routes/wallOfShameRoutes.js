import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// GET /api/wall-of-shame: Public accountability board of overdue/neglected civic issues
router.get('/', async (req, res) => {
  try {
    const { department, minDays = 0, sort = 'neglect' } = req.query;

    // A complaint belongs on the Wall of Shame if:
    // 1. It is explicitly flagged
    // 2. OR it is still unresolved and has been pending for more than 2 days
    const baseQuery = {
      status: { $in: ['Submitted', 'Approved', 'Assigned', 'In Progress'] },
      $or: [
        { 'wallOfShame.isFlagged': true },
        { createdAt: { $lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } },
      ],
    };

    if (department && department !== 'All') {
      baseQuery.$or = [
        { 'aiSeverity.suggestedDepartment': department },
        { 'wallOfShame.responsibleAuthority': department },
      ];
    }

    const complaints = await Complaint.find(baseQuery);

    // Compute dynamic days neglected and shame score
    const shamedList = complaints.map((doc) => {
      const obj = doc.toJSON();
      const createdTime = new Date(doc.createdAt).getTime();
      const now = Date.now();
      const daysNeglected = Math.max(1, Math.floor((now - createdTime) / (1000 * 60 * 60 * 24)));
      const severityMultiplier = doc.aiSeverity?.level === 'Critical' ? 3 : doc.aiSeverity?.level === 'High' ? 2 : 1;
      const shameScore = daysNeglected * 10 * severityMultiplier + (doc.wallOfShame?.shameUpvotes || 0) * 5;

      return {
        ...obj,
        daysNeglected,
        shameScore,
      };
    });

    // Filter by minDays
    let filtered = shamedList.filter((item) => item.daysNeglected >= Number(minDays));

    // Sort
    if (sort === 'neglect') {
      filtered.sort((a, b) => b.daysNeglected - a.daysNeglected);
    } else if (sort === 'upvotes') {
      filtered.sort((a, b) => (b.wallOfShame?.shameUpvotes || 0) - (a.wallOfShame?.shameUpvotes || 0));
    } else if (sort === 'severity') {
      filtered.sort((a, b) => (b.aiSeverity?.score || 0) - (a.aiSeverity?.score || 0));
    }

    // Department Shame Statistics & Defaulter rankings
    const departmentStats = {};
    for (const item of shamedList) {
      const dept = item.aiSeverity?.suggestedDepartment || item.wallOfShame?.responsibleAuthority || 'General Municipal Board';
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          name: dept,
          unresolvedCount: 0,
          totalDaysNeglect: 0,
          criticalCount: 0,
          totalUpvotes: 0,
        };
      }
      departmentStats[dept].unresolvedCount += 1;
      departmentStats[dept].totalDaysNeglect += item.daysNeglected;
      departmentStats[dept].totalUpvotes += item.wallOfShame?.shameUpvotes || 0;
      if (item.aiSeverity?.level === 'Critical') {
        departmentStats[dept].criticalCount += 1;
      }
    }

    const departmentRankings = Object.values(departmentStats)
      .map((d) => ({
        ...d,
        avgDaysDelayed: Math.round(d.totalDaysNeglect / d.unresolvedCount),
      }))
      .sort((a, b) => b.unresolvedCount - a.unresolvedCount);

    res.json({
      success: true,
      totalShamedIssues: filtered.length,
      worstDepartment: departmentRankings[0] || null,
      departmentRankings,
      complaints: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
