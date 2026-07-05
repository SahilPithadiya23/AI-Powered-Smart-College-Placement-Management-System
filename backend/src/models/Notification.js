import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    readAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
