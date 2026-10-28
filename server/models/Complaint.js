import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Pothole & Road Damage',
        'Garbage & Waste Disposal',
        'Water Supply & Leakage',
        'Streetlight & Electrical',
        'Sewage & Drainage Overflow',
        'Public Sanitation & Hygiene',
        'Illegal Encroachment',
        'Parks & Public Property',
        'Other Civic Hazard',
      ],
      default: 'Other Civic Hazard',
    },
    location: {
      locationType: {
        type: String,
        enum: ['manual', 'gps'],
        default: 'manual',
      },
      address: {
        type: String,
        required: [true, 'Location address or landmark is required'],
      },
      landmark: {
        type: String,
        default: '',
      },
      ward: {
        type: String,
        default: 'General Ward',
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
    },
    media: {
      mediaType: {
        type: String,
        enum: ['photo', 'video', 'none'],
        default: 'none',
      },
      url: {
        type: String,
        default: '',
      },
      filename: {
        type: String,
        default: '',
      },
      mimetype: {
        type: String,
        default: '',
      },
      size: {
        type: Number,
        default: 0,
      },
    },
    citizen: {
      name: {
        type: String,
        default: 'Civic Watcher',
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
      isGuest: {
        type: Boolean,
        default: true,
      },
    },
    aiSeverity: {
      level: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Medium',
      },
      score: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
      },
      urgency: {
        type: String,
        default: 'Standard',
      },
      confidence: {
        type: Number,
        default: 0.92,
      },
      reasoning: {
        type: String,
        default: 'Assessed by CivicPulse Automated AI Severity Model.',
      },
      factors: [
        {
          type: String,
        },
      ],
      suggestedDepartment: {
        type: String,
        default: 'Municipal Infrastructure Board',
      },
      slaHours: {
        type: Number,
        default: 48,
      },
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Approved',
        'Assigned',
        'In Progress',
        'Under Review',
        'Resolved',
        'Rejected',
      ],
      default: 'Submitted',
    },
    assignedWorker: {
      workerId: {
        type: String,
        default: null,
      },
      name: {
        type: String,
        default: '',
      },
      department: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
      assignedAt: {
        type: Date,
        default: null,
      },
      isSelfClaimed: {
        type: Boolean,
        default: false,
      },
    },
    resolutionProof: {
      photoUrl: {
        type: String,
        default: '',
      },
      filename: {
        type: String,
        default: '',
      },
      notes: {
        type: String,
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
    adminReview: {
      decision: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
      },
      feedback: {
        type: String,
        default: '',
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      reviewedBy: {
        type: String,
        default: 'Chief Municipal Officer',
      },
    },
    wallOfShame: {
      isFlagged: {
        type: Boolean,
        default: false,
      },
      shameUpvotes: {
        type: Number,
        default: 0,
      },
      responsibleAuthority: {
        type: String,
        default: 'Municipal Corporation',
      },
      flaggedAt: {
        type: Date,
        default: null,
      },
      officialEscalated: {
        type: String,
        default: 'Ward Zonal Officer',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating overdue days
complaintSchema.virtual('daysOpen').get(function () {
  const end = this.status === 'Resolved' && this.adminReview.reviewedAt
    ? this.adminReview.reviewedAt
    : new Date();
  const diffTime = Math.abs(end - this.createdAt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Configure JSON serialization to include virtuals
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

export default mongoose.model('Complaint', complaintSchema);
