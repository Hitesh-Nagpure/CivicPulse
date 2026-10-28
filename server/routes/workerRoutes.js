import express from 'express';
import Worker from '../models/Worker.js';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// 1. List all registered municipal workers
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ resolvedCount: -1 });
    res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get unassigned pool of complaints open for voluntary worker claiming
router.get('/unassigned-pool', async (req, res) => {
  try {
    // Complaints that are Approved or Submitted with no worker assigned
    const pool = await Complaint.find({
      status: { $in: ['Approved', 'Submitted'] },
      $or: [
        { 'assignedWorker.workerId': null },
        { 'assignedWorker.workerId': '' },
        { assignedWorker: { $exists: false } },
      ],
    }).sort({ 'aiSeverity.score': -1, createdAt: -1 });

    res.json({ success: true, count: pool.length, pool });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get tasks assigned to a specific worker
router.get('/:workerId/tasks', async (req, res) => {
  try {
    const { workerId } = req.params;
    const tasks = await Complaint.find({
      'assignedWorker.workerId': workerId,
    }).sort({ createdAt: -1 });

    const worker = await Worker.findById(workerId);

    res.json({
      success: true,
      worker,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
