import {
  validatePaymentVerification,
  validateWebhookSignature,
} from 'razorpay/dist/utils/razorpay-utils.js';
import orderModel from '../model/order.model.js';
import productModel from '../model/product.model.js';
import cartModel from '../model/cart.model.js';
import couponModel from '../model/coupon.model.js';
import settingsModel from '../model/settings.model.js';
import userModel from '../model/user.model.js';
import { getCartDetails } from './cart.controller.js';
import { notifyBackInStock } from './wishlist.controller.js';
import { createOrder, refundPayment } from '../services/paymet.servce.js';
import { calculatePricing, getCouponError } from '../utils/pricing.js';
import { getPagination, escapeRegex } from '../utils/query.js';
import { Config } from '../config/config.js';

// Orders that were actually paid for (abandoned checkouts are excluded).
const PLACED = { 'payment.status': { $in: ['paid', 'refunded'] } };

// Allowed admin status changes.
const NEXT_STATUS = {
  pending: [],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const serverError = (res, label, error, message) => {
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message });
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Prices the user's cart for checkout, or explains why it can't be bought.
const buildCheckout = async (userId, couponCode) => {
  const cart = await getCartDetails(userId);
  if (!cart || cart.items.length === 0) {
    return { status: 400, error: 'Your bag is empty' };
  }

  const lines = [];
  for (const item of cart.items) {
    const { product } = item;
    // getCartDetails keeps only the line's selected variant.
    const variant = product.variants[0];
    const stock = variant ? variant.stock : product.stock;

    if (product.status !== 'active') {
      return { status: 409, error: `${product.title} is no longer available` };
    }
    if (product.trackQuantity && item.quantity > stock) {
      return {
        status: 409,
        error:
          stock > 0
            ? `Only ${stock} left of ${product.title}`
            : `${product.title} is out of stock`,
      };
    }

    lines.push({
      item,
      product,
      variant,
      unitPrice: variant?.price?.amount ?? product.price.amount,
      quantity: item.quantity,
      taxable: product.chargeTax,
    });
  }

  const settings = await settingsModel.getSettings();
  let pricing = calculatePricing(lines, settings);
  let coupon = null;

  if (couponCode) {
    coupon = await couponModel.findOne({
      code: String(couponCode).trim().toUpperCase(),
    });
    const couponError = getCouponError(coupon, pricing.subtotal);
    if (couponError) return { status: 400, error: couponError };
    pricing = calculatePricing(lines, settings, coupon);
  }

  return {
    lines,
    coupon,
    settings,
    pricing: { ...pricing, currency: cart.currency || 'INR' },
  };
};

// Moves stock for tracked products: -1 when paid, +1 when cancelled.
const adjustStock = (items, direction) =>
  Promise.all(
    items.map(({ product, variantId, quantity }) => {
      const change = direction * quantity;
      return variantId
        ? productModel.updateOne(
            { _id: product, trackQuantity: true, 'variants._id': variantId },
            { $inc: { stock: change, 'variants.$.stock': change } },
          )
        : productModel.updateOne(
            { _id: product, trackQuantity: true },
            { $inc: { stock: change } },
          );
    }),
  );

// Settles an unpaid order exactly once — verify and the webhook can race.
const markOrderPaid = async (razorpayOrderId, { paymentId, signature }) => {
  const order = await orderModel.findOneAndUpdate(
    {
      'payment.razorpayOrderId': razorpayOrderId,
      // A failed attempt can still be retried and succeed on the same order.
      'payment.status': { $in: ['pending', 'failed'] },
    },
    {
      $set: {
        'payment.status': 'paid',
        'payment.razorpayPaymentId': paymentId,
        'payment.razorpaySignature': signature,
        status: 'processing',
      },
    },
    { returnDocument: 'after' },
  );
  if (!order) return null;

  await adjustStock(order.items, -1);
  if (order.coupon?.code) {
    await couponModel.updateOne(
      { code: order.coupon.code },
      { $inc: { usedCount: 1 } },
    );
  }
  await cartModel.updateOne({ user: order.user }, { $set: { items: [] } });
  return order;
};

const cancelOrderAndRefund = async (order) => {
  if (order.payment.status === 'paid') {
    const refund = await refundPayment(
      order.payment.razorpayPaymentId,
      order.pricing.total,
    );
    order.payment.status = 'refunded';
    order.payment.refundId = refund.id;
  }
  order.status = 'cancelled';
  await order.save();
  await adjustStock(order.items, 1);
  // Returned stock can fulfil back-in-stock alerts.
  order.items.forEach(({ product }) =>
    notifyBackInStock(product).catch((error) =>
      console.error('Back-in-stock alert error:', error),
    ),
  );
  return order;
};

/* ------------------------------------------------------------------ */
/* Checkout                                                            */
/* ------------------------------------------------------------------ */

export const getOrderSummary = async (req, res) => {
  try {
    const checkout = await buildCheckout(req.user._id, req.body.couponCode);
    if (checkout.error) {
      return res
        .status(checkout.status)
        .json({ success: false, message: checkout.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Order summary calculated',
      pricing: checkout.pricing,
      coupon: checkout.coupon ? { code: checkout.coupon.code } : null,
      freeShippingThreshold: checkout.settings.freeShippingThreshold,
    });
  } catch (error) {
    return serverError(res, 'getOrderSummary', error, 'Failed to price order');
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { addressId, couponCode } = req.body;
    const address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Choose a shipping address',
      });
    }

    const checkout = await buildCheckout(req.user._id, couponCode);
    if (checkout.error) {
      return res
        .status(checkout.status)
        .json({ success: false, message: checkout.error });
    }

    const { lines, coupon, pricing } = checkout;
    const razorpayOrder = await createOrder(pricing.total, pricing.currency);

    const order = await orderModel.create({
      user: req.user._id,
      items: lines.map(({ item, product, variant, unitPrice }) => ({
        product: product._id,
        variantId: item.variantId || null,
        title: product.title,
        slug: product.slug,
        image: variant?.images?.[0]?.url || product.images?.[0]?.url,
        size: item.size,
        colorway: item.colorway,
        quantity: item.quantity,
        price: { amount: unitPrice, currency: pricing.currency },
      })),
      shippingAddress: address.toObject(),
      pricing,
      coupon: coupon
        ? { code: coupon.code, discount: pricing.discount }
        : undefined,
      payment: { razorpayOrderId: razorpayOrder.id },
    });

    return res.status(201).json({
      success: true,
      message: 'Order created',
      orderId: order._id,
      razorpayOrder,
      key: Config.RAZORPAY_API_KEY,
    });
  } catch (error) {
    return serverError(res, 'createOrder', error, 'Failed to create order');
  }
};

export const verifyOrderController = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await orderModel.findOne({
      'payment.razorpayOrderId': razorpayOrderId,
      user: req.user._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    const isVerified = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      razorpaySignature,
      Config.RAZORPAY_API_SECRET,
    );
    if (!isVerified) {
      await orderModel.updateOne(
        { _id: order._id, 'payment.status': 'pending' },
        { $set: { 'payment.status': 'failed' } },
      );
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Null when the webhook already settled it — return the stored order.
    const paidOrder =
      (await markOrderPaid(razorpayOrderId, {
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      })) || (await orderModel.findById(order._id));

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: paidOrder,
    });
  } catch (error) {
    return serverError(res, 'verifyOrder', error, 'Failed to verify payment');
  }
};

// Razorpay server-to-server events: settles orders even if the tab was closed.
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (
      !Config.RAZORPAY_WEBHOOK_SECRET ||
      !signature ||
      !validateWebhookSignature(
        req.rawBody.toString(),
        signature,
        Config.RAZORPAY_WEBHOOK_SECRET,
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    const payment = payload?.payment?.entity;

    if (event === 'payment.captured') {
      await markOrderPaid(payment.order_id, { paymentId: payment.id });
    } else if (event === 'payment.failed') {
      await orderModel.updateOne(
        { 'payment.razorpayOrderId': payment.order_id, 'payment.status': 'pending' },
        { $set: { 'payment.status': 'failed' } },
      );
    }

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    return serverError(res, 'razorpayWebhook', error, 'Webhook failed');
  }
};

/* ------------------------------------------------------------------ */
/* Customer orders                                                     */
/* ------------------------------------------------------------------ */

export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id, ...PLACED })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      orders,
    });
  } catch (error) {
    return serverError(res, 'getMyOrders', error, 'Failed to fetch orders');
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel
      .findOne({ _id: req.params.orderId, user: req.user._id })
      .lean();
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      order,
    });
  } catch (error) {
    return serverError(res, 'getOrderById', error, 'Failed to fetch order');
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'This order can no longer be cancelled',
      });
    }

    await cancelOrderAndRefund(order);
    return res.status(200).json({
      success: true,
      message: 'Order cancelled and refunded',
      order,
    });
  } catch (error) {
    return serverError(res, 'cancelOrder', error, 'Failed to cancel order');
  }
};

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { ...PLACED };

    if (status) filter.status = status;
    if (search) {
      // Order numbers are displayed as "#" + the id's last 8 characters.
      const term = escapeRegex(search.trim().replace(/^#/, ''));
      const pattern = new RegExp(term, 'i');
      const customers = await userModel
        .find({
          $or: [
            { email: pattern },
            { 'name.firstName': pattern },
            { 'name.lastName': pattern },
          ],
        })
        .select('_id');
      filter.$or = [
        { user: { $in: customers.map((customer) => customer._id) } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: term,
              options: 'i',
            },
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      orderModel
        .find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      orderModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      orders,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError(res, 'getAllOrders', error, 'Failed to fetch orders');
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderModel.findOne({
      _id: req.params.orderId,
      ...PLACED,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    if (!NEXT_STATUS[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `A ${order.status} order can't be marked ${status}`,
      });
    }

    if (status === 'cancelled') {
      await cancelOrderAndRefund(order);
    } else {
      order.status = status;
      await order.save();
    }

    await order.populate('user', 'name email phone');
    return res.status(200).json({
      success: true,
      message: `Order marked ${status}`,
      order,
    });
  } catch (error) {
    return serverError(res, 'updateOrderStatus', error, 'Failed to update order');
  }
};
