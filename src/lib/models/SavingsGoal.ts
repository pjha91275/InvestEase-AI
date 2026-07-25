import mongoose, { Schema } from 'mongoose';

const SavingsGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentSavings: { type: Number, required: true, default: 0 },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export const SavingsGoal =
  mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', SavingsGoalSchema);
