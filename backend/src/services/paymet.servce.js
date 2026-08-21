import { Config } from '../config/config.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: Config.RAZORPAY_API_KEY,
  key_secret: Config.RAZORPAY_API_SECRET,
});

export const createOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100,
    currency: currency,
  };

  const order = await razorpay.orders.create(options);

  return order;
};
