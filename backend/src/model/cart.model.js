import mongoose from 'mongoose';
import { SIZES } from './product.model.js';

/* A single chosen colourway, denormalised onto the line item so the cart      */
/* still renders correctly even if the product's colourways change later.      */
const cartColorwaySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    hex: { type: String },
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    // Optional reference to the selected variant sub-document on the product.
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
      type: cartColorwaySchema,
      default: undefined,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { _id: true, timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    // One cart per user.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const cartModel = mongoose.model('cart', cartSchema);
export default cartModel;
