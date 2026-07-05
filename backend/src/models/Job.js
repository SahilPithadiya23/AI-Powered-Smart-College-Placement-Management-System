import mongoose from 'mongoose';
import { JOB_STATUSES } from '../utils/constants.js';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    package: { type: Number, required: true },
    location: String,
    roundsConducted: [String],
    jobType: { type: String, enum: ['full_time', 'internship', 'contract'], default: 'full_time' },
    workMode: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'onsite' },
    requiredSkills: [String],
    allowedBranches: [String],
    minimumCgpa: { type: Number, default: 0 },
    maximumBacklogs: { type: Number, default: 0 },
    graduationYear: Number,
    openDate: Date,
    closingDate: { type: Date, required: true },
    status: { type: String, enum: JOB_STATUSES, default: 'active' },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    applicationsCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    offersCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

export const Job = mongoose.model('Job', jobSchema);
