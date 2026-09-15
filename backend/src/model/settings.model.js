import mongoose from 'mongoose';

/* Store-wide pricing settings, kept in a single document. */
const settingsSchema = new mongoose.Schema(
  {
    // Percentage applied to products that have `chargeTax` enabled.
    taxRate: { type: Number, default: 18, min: 0, max: 100 },
    shippingFee: { type: Number, default: 199, min: 0 },
    freeShippingThreshold: { type: Number, default: 5000, min: 0 },
  },
  { timestamps: true },
);

// Returns the settings document, creating it with defaults on first use.
settingsSchema.statics.getSettings = function () {
  return this.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
};

const settingsModel = mongoose.model('settings', settingsSchema);
export default settingsModel;
