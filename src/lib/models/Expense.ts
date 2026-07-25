import mongoose, { Schema } from 'mongoose';

const ExpenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Food', 'Travel', 'Shopping', 'Education', 'Medical', 'Entertainment', 'Bills', 'Others'],
      required: true,
    },
    merchant: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],
      required: true,
    },
    notes: { type: String, default: '' },
    isScanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
