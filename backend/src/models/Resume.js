import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Resume' },
    fileUrl: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    parsed: {
      skills: [String],
      education: [String],
      projects: [String],
      certifications: [String]
    }
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);
