import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    designation: String,
    phone: String,
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
  },
  { timestamps: true }
);

export const Recruiter = mongoose.model('Recruiter', recruiterSchema);
