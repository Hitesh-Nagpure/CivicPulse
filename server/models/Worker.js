import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: true,
    },
    badgeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      default: 'General Civic Repairs',
    },
    avatar: {
      type: String,
      default: '',
    },
    assignedZone: {
      type: String,
      default: 'City Center & West Zone',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    resolvedCount: {
      type: Number,
      default: 0,
    },
    activeJobsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Worker', workerSchema);
