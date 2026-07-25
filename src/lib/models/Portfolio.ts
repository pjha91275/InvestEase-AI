import mongoose, { Schema } from 'mongoose';

const PortfolioSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    allocations: {
      indexFunds: { type: Number, default: 40 },
      mutualFunds: { type: Number, default: 20 },
      stocks: { type: Number, default: 20 },
      gold: { type: Number, default: 10 },
      crypto: { type: Number, default: 10 },
    },
    balances: {
      indexFunds: { type: Number, default: 0 },
      mutualFunds: { type: Number, default: 0 },
      stocks: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      crypto: { type: Number, default: 0 },
    },
    totalInvested: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);
