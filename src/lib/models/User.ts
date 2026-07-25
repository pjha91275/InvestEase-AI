import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    income: { type: Number, default: 0 },
    occupation: { type: String, default: '' },
    monthlySavingsGoal: { type: Number, default: 0 },
    notifications: {
      budgetAlerts: { type: Boolean, default: true },
      fraudAlerts: { type: Boolean, default: true },
      savingsReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
