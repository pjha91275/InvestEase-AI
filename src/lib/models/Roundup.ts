import mongoose, { Schema } from 'mongoose';

const RoundupSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
    amount: { type: Number, required: true },
    originalAmount: { type: Number, required: true },
    roundedAmount: { type: Number, required: true },
    merchant: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Invested'], default: 'Pending' },
  },
  { timestamps: true }
);

export const Roundup = mongoose.models.Roundup || mongoose.model('Roundup', RoundupSchema);
