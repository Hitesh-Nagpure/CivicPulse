import mongoose from 'mongoose';

const citizenSchema = new mongoose.Schema(
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
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    ward: {
      type: String,
      default: 'Ward 4 - Green Valley',
    },
    resolvedCount: {
      type: Number,
      default: 0,
    },
    totalReported: {
      type: Number,
      default: 0,
    },
    civicPoints: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: 'Active Citizen',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Citizen', citizenSchema);
