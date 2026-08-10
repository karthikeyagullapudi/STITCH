import mongoose from 'mongoose';
import { SIZES } from './product.model.js';

const wishlistColorwaySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    hex: { type: String },
  },
  { _id: false },
);

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    size: {
      type: String,
      enum: SIZES,
      uppercase: true,
    },
    colorway: {
      type: wishlistColorwaySchema,
      default: undefined,
    },
  },
  { _id: true, timestamps: true },
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],

      validate: {
        validator: (v) => v.length <= 100,
        message: 'A wishlist cannot hold more than 100 items',
      },
    },
  },
  { timestamps: true },
);

wishlistSchema.index({ user: 1, 'items.product': 1 });

const wishlistModel = mongoose.model('wishlist', wishlistSchema);
export default wishlistModel;
