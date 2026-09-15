import mongoose from 'mongoose';

export const COUPON_TYPES = ['percentage', 'fixed'];

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: COUPON_TYPES,
      required: true,
    },
    // Percent off for `percentage`, amount off for `fixed`.
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    // Caps percentage discounts; null means no cap.
    maxDiscount: { type: Number, default: null, min: 0 },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const couponModel = mongoose.model('coupon', couponSchema);
export default couponModel;
