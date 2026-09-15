import mongoose from 'mongoose';
import { priceSchema } from './product.model.js';
import { addressSchema } from './user.model.js';

// `pending` = awaiting payment; paid orders start at `processing`.
export const ORDER_STATUS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];
export const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded'];

/* Line items are snapshots, so orders never change when products do. */
const orderItemSchema = new mongoose.Schema(
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
    title: { type: String, required: true },
    slug: String,
    image: String,
    size: String,
    colorway: {
      name: String,
      hex: String,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: priceSchema, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    coupon: {
      code: String,
      discount: Number,
    },
    payment: {
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: String,
      razorpaySignature: String,
      refundId: String,
      status: {
        type: String,
        enum: PAYMENT_STATUS,
        default: 'pending',
      },
    },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

const orderModel = mongoose.model('order', orderSchema);
export default orderModel;
