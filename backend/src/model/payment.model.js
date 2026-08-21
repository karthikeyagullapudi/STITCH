import mongoose from 'mongoose';
import { priceSchema } from './product.model.js';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    amount: {
      type: priceSchema,
      required: true,
    },
    items: [
      {
        title: String,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        size: String,
        colorway: {
          name: String,
          hex: String,
        },
        quantity: {
          type: Number,
          required: true,
        },
        images: [{ url: String }],
        price: priceSchema,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

const PaymentModel = mongoose.model('Payment', paymentSchema);
export default PaymentModel;
