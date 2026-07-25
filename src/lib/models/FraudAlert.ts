import mongoose, { Schema } from 'mongoose';

const FraudAlertSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number },
    category: { type: String },
    merchant: { type: String },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical', 'Low', 'Medium', 'High'],
      default: 'Warning',
    },
    score: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    ruleTriggered: { type: String },
    recommendation: { type: String },
    timestamp: { type: Date, default: Date.now },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FraudAlert =
  mongoose.models.FraudAlert || mongoose.model('FraudAlert', FraudAlertSchema);
