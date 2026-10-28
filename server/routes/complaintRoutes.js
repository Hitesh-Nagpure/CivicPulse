import express from 'express';
import Complaint from '../models/Complaint.js';
import Citizen from '../models/Citizen.js';
import Worker from '../models/Worker.js';
import { upload } from '../middleware/upload.js';
import { assignSeverity } from '../services/aiSeverityService.js';

const router = express.Router();

// Helper to generate unique human-readable tracking ID
function generateTrackingId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CP-${new Date().getFullYear()}-${randomCode}`;
}

// 0. Live AI Preview Endpoint (Free AI model on demand)
router.post('/ai/preview-severity', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const aiAnalysis = await assignSeverity(title || '', description || '', category || '');
    res.json({ success: true, aiAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1. Create a new complaint (No login required! Supports Photo or Video, GPS or Manual location)
router.post('/', upload.single('mediaFile'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      locationType = 'manual',
      address,
      landmark = '',
      ward = 'General Ward',
      latitude,
      longitude,
      accuracy,
      citizenName = 'Civic Watcher',
      citizenEmail = '',
      citizenPhone = '',
    } = req.body;

    if (!title || !description || !address) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location address are mandatory.',
      });
    }

    // Media metadata handling
    let media = {
      mediaType: 'none',
      url: '',
      filename: '',
      mimetype: '',
      size: 0,
    };

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      media = {
        mediaType: isVideo ? 'video' : 'photo',
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    } else if (req.body.mediaUrl) {
      // In case pre-seeded or external image provided
      media = {
        mediaType: 'photo',
        url: req.body.mediaUrl,
        filename: 'external-image',
        mimetype: 'image/jpeg',
        size: 1024,
      };
    }

    // 2. Free AI Model automatic severity assignment!
    const aiSeverity = await assignSeverity(title, description, category);

    // Generate unique tracking code
    let trackingId = generateTrackingId();
    // Ensure uniqueness
    while (await Complaint.findOne({ trackingId })) {
      trackingId = generateTrackingId();
    }

    const complaint = new Complaint({
      trackingId,
      title,
      description,
      category: category || 'Other Civic Hazard',
      location: {
        locationType: locationType === 'gps' ? 'gps' : 'manual',
        address,
        landmark,
        ward,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null,
      },
      media,
      citizen: {
        name: citizenName || 'Civic Watcher',
        email: citizenEmail ? citizenEmail.trim().toLowerCase() : '',
        phone: citizenPhone || '',
        isGuest: !citizenEmail,
      },
      aiSeverity,
      status: 'Submitted',
      wallOfShame: {
        isFlagged: false,
        shameUpvotes: 0,
        responsibleAuthority: aiSeverity.suggestedDepartment || 'Municipal Corporation',
      },
    });

    await complaint.save();

    // If citizen provided email, update or create citizen record for civic leaderboard tracking
    if (citizenEmail && citizenEmail.includes('@')) {
      await Citizen.findOneAndUpdate(
        { email: citizenEmail.trim().toLowerCase() },
        {
          $setOnInsert: { name: citizenName || 'Active Citizen', email: citizenEmail.trim().toLowerCase() },
          $inc: { totalReported: 1, civicPoints: 10 },
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully! Keep your tracking ID safe.',
      complaint,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. List all complaints with filtering, search, and Wall of Shame status
router.get('/', async (req, res) => {
  try {
    const {
      status,
      category,
      severity,
      search,
      citizenEmail,
      workerId,
      ward,
      shameOnly,
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (severity && severity !== 'All') {
      query['aiSeverity.level'] = severity;
    }

    if (ward && ward !== 'All') {
      query['location.ward'] = ward;
    }

    if (citizenEmail) {
      query['citizen.email'] = citizenEmail.trim().toLowerCase();
    }

    if (workerId) {
      query['assignedWorker.workerId'] = workerId;
    }

    if (shameOnly === 'true') {
      // Wall of shame: flagged or unresolved for over 2 days
      query.$or = [
        { 'wallOfShame.isFlagged': true },
        {
          status: { $in: ['Submitted', 'Approved', 'Assigned', 'In Progress'] },
          createdAt: { $lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        },
      ];
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { trackingId: regex },
        { 'location.address': regex },
        { 'citizen.name': regex },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get single complaint by ID or Tracking ID
router.get('/:idOrTracking', async (req, res) => {
  try {
    const { idOrTracking } = req.params;
    let complaint = null;

    if (idOrTracking.startsWith('CP-')) {
      complaint = await Complaint.findOne({ trackingId: idOrTracking.toUpperCase() });
    } else if (idOrTracking.match(/^[0-9a-fA-F]{24}$/)) {
      complaint = await Complaint.findById(idOrTracking);
    } else {
      complaint = await Complaint.findOne({ trackingId: idOrTracking.toUpperCase() });
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Admin Approves Complaint
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = 'Approved';
    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint approved. It is now open for worker assignment or self-claiming.',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Admin Assigns Complaint to a Worker
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName, department, phone } = req.body;

    if (!workerId || !workerName) {
      return res.status(400).json({ success: false, message: 'Worker details are required.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = 'Assigned';
    complaint.assignedWorker = {
      workerId,
      name: workerName,
      department: department || complaint.aiSeverity.suggestedDepartment,
      phone: phone || '',
      assignedAt: new Date(),
      isSelfClaimed: false,
    };

    await complaint.save();

    // Increment worker's active tasks count
    await Worker.findByIdAndUpdate(workerId, { $inc: { activeJobsCount: 1 } });

    res.json({
      success: true,
      message: `Complaint assigned to ${workerName} successfully.`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Worker Willingly Accepts & Claims Complaint without prior assignment!
router.put('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName, department, phone } = req.body;

    if (!workerId || !workerName) {
      return res.status(400).json({ success: false, message: 'Worker identity required.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.status === 'Assigned' || complaint.status === 'In Progress' || complaint.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'This complaint is already claimed or resolved.',
      });
    }

    complaint.status = 'In Progress';
    complaint.assignedWorker = {
      workerId,
      name: workerName,
      department: department || 'Municipal Emergency Response',
      phone: phone || '',
      assignedAt: new Date(),
      isSelfClaimed: true,
    };

    await complaint.save();

    await Worker.findByIdAndUpdate(workerId, { $inc: { activeJobsCount: 1 } });

    res.json({
      success: true,
      message: `You have successfully self-assigned and claimed complaint #${complaint.trackingId}!`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Worker updates status to "In Progress"
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Worker Completes Job & Uploads Resolution Photo Proof
router.post('/:id/submit-work', upload.single('resolutionPhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    let photoUrl = '';
    let filename = '';

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      filename = req.file.filename;
    } else if (req.body.photoUrl) {
      photoUrl = req.body.photoUrl;
      filename = 'resolution-image';
    } else {
      return res.status(400).json({
        success: false,
        message: 'A photo proving the resolved work must be uploaded.',
      });
    }

    complaint.status = 'Under Review';
    complaint.resolutionProof = {
      photoUrl,
      filename,
      notes: notes || 'Work completed on site. Awaiting Chief Municipal Officer verification.',
      submittedAt: new Date(),
    };
    complaint.adminReview.decision = 'Pending';

    await complaint.save();

    res.json({
      success: true,
      message: 'Resolution proof submitted to Admin for verification!',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Admin Accepts or Rejects the Work
router.post('/:id/review-work', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, feedback, reviewerName = 'Chief Municipal Officer' } = req.body;

    if (!['Accepted', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "Accepted" or "Rejected".',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.adminReview = {
      decision,
      feedback: feedback || (decision === 'Accepted' ? 'Work verified and approved.' : 'Work unsatisfactory. Rework required.'),
      reviewedAt: new Date(),
      reviewedBy: reviewerName,
    };

    if (decision === 'Accepted') {
      complaint.status = 'Resolved';
      complaint.wallOfShame.isFlagged = false;

      // Update worker statistics
      if (complaint.assignedWorker && complaint.assignedWorker.workerId) {
        await Worker.findByIdAndUpdate(complaint.assignedWorker.workerId, {
          $inc: { resolvedCount: 1, activeJobsCount: -1 },
        });
      }

      // Update citizen leaderboard statistics!
      if (complaint.citizen.email) {
        const citizen = await Citizen.findOne({ email: complaint.citizen.email });
        if (citizen) {
          citizen.resolvedCount = (citizen.resolvedCount || 0) + 1;
          citizen.civicPoints = (citizen.civicPoints || 0) + 50; // 50 points per resolved issue!

          // Dynamic badges based on solved issues
          if (citizen.resolvedCount >= 10) citizen.badge = 'City Champion 🏆';
          else if (citizen.resolvedCount >= 5) citizen.badge = 'Urban Guardian 🌟';
          else if (citizen.resolvedCount >= 3) citizen.badge = 'Neighborhood Sentinel 🛡️';
          else citizen.badge = 'Active Citizen 🌱';

          await citizen.save();
        } else {
          await Citizen.create({
            name: complaint.citizen.name || 'Civic Hero',
            email: complaint.citizen.email,
            phone: complaint.citizen.phone,
            ward: complaint.location.ward,
            resolvedCount: 1,
            totalReported: 1,
            civicPoints: 60,
            badge: 'Active Citizen 🌱',
          });
        }
      }
    } else {
      // Rejected: Reassigned to worker for rework
      complaint.status = 'In Progress';
    }

    await complaint.save();

    res.json({
      success: true,
      message: decision === 'Accepted'
        ? 'Work accepted! Complaint marked as Resolved and Citizen credited on Leaderboard.'
        : 'Work rejected and reassigned to worker with your feedback.',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Admin Deletes Complaint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({
      success: true,
      message: `Complaint #${complaint.trackingId} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Public Shame Upvote (Wall of Shame interactive feature)
router.post('/:id/shame-upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.wallOfShame.shameUpvotes = (complaint.wallOfShame.shameUpvotes || 0) + 1;
    complaint.wallOfShame.isFlagged = true;
    await complaint.save();

    res.json({
      success: true,
      shameUpvotes: complaint.wallOfShame.shameUpvotes,
      message: 'Shame vote recorded! Public accountability notice sent to department.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
