import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    logo: String,
    website: String,
    location: String,
    description: String,
    hiringDetails: String,
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
