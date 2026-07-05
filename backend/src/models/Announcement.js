import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, enum: ['drive', 'workshop', 'mock_interview', 'training'], default: 'drive' },
    audience: [{ type: String }],
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
