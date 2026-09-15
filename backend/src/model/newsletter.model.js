import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Idempotent — subscribing twice keeps a single entry.
newsletterSchema.statics.subscribe = function (email) {
  return this.updateOne(
    { email },
    { $setOnInsert: { email } },
    { upsert: true },
  );
};

const newsletterModel = mongoose.model('newsletter', newsletterSchema);
export default newsletterModel;
