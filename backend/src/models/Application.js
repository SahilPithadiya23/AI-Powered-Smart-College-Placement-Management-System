import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'applied' },
    history: [
      {
        status: String,
        note: String,
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
      }
    ],
    atsScore: Number,
    matchingSkills: [String],
    missingSkills: [String]
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
