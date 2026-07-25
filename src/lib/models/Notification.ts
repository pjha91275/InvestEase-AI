import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
