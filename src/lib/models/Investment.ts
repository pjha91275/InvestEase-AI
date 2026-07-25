import mongoose, { Schema } from 'mongoose';

const InvestmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    allocationsApplied: {
      indexFunds: { type: Number, required: true },
      mutualFunds: { type: Number, required: true },
      stocks: { type: Number, required: true },
      gold: { type: Number, required: true },
      crypto: { type: Number, required: true },
    },
    description: { type: String, default: 'Automated round-up sweep investment' },
  },
  { timestamps: true }
);

export const Investment = mongoose.models.Investment || mongoose.model('Investment', InvestmentSchema);
