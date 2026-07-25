import mongoose, { Schema } from 'mongoose';

const ChatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'model', 'assistant'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
