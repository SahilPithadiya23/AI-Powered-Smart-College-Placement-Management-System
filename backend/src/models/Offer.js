import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: Number,
    joiningDate: Date,
    offerLetter: String,
    status: { type: String, enum: ['released', 'accepted', 'rejected'], default: 'released' }
  },
  { timestamps: true }
);

export const Offer = mongoose.model('Offer', offerSchema);
