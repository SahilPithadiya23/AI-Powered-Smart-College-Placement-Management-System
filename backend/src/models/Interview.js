import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    interviewType: { type: String, enum: ['online', 'offline', 'telephonic'], default: 'online' },
    meetingLink: String,
    notes: String,
    status: { type: String, enum: ['scheduled', 'rescheduled', 'cancelled', 'completed'], default: 'scheduled' }
  },
  { timestamps: true }
);

export const Interview = mongoose.model('Interview', interviewSchema);
