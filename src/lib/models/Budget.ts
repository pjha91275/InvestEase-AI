import mongoose, { Schema } from 'mongoose';

const BudgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
    limit: { type: Number, required: true },
    categoryBudgets: {
      Food: { type: Number, default: 0 },
      Travel: { type: Number, default: 0 },
      Shopping: { type: Number, default: 0 },
      Education: { type: Number, default: 0 },
      Medical: { type: Number, default: 0 },
      Entertainment: { type: Number, default: 0 },
      Bills: { type: Number, default: 0 },
      Others: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Unique budget per user per month
BudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
