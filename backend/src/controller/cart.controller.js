import cartModel from '../model/cart.model.js';
import productModel from '../model/product.model.js';
import { createOrder } from '../services/paymet.servce.js';
import { Config } from '../config/config.js';
import mongoose from 'mongoose';
import PaymentModel from '../model/payment.model.js';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';

/* Populate each line item with just enough product data for the storefront. */
const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    select:
      'title slug images price compareAtPrice sku stock status category variants',
  });

// Returns the user's cart, populated and reloaded from the given saved doc using aggregation pipeline.
const respondWithCart = async (res, cartId, message, status = 200) => {
  const cartDoc = await cartModel.findById(cartId);
  if (!cartDoc) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const aggregatedCart = await cartModel.aggregate(
    getCartPipeLine(cartDoc.user),
  );

  const cart = aggregatedCart[0] || {
    _id: cartDoc._id,
    user: cartDoc.user,
    items: [],
    totalPrice: 0,
    currency: 'INR',
  };

  return res.status(status).json({ success: true, message, cart });
};

const getCartDetails = async (userId) => {
  let cart = (
    await cartModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(String(userId)),
        },
      },
      {
        $unwind: {
          path: '$items',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'items.product',
        },
      },
      {
        $unwind: {
          path: '$items.product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$items.product.variants',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              $expr: {
                $eq: ['$items.variantId', '$items.product.variants._id'],
              },
            },
            {
              'items.variantId': null,
            },
            {
              'items.variantId': { $exists: false },
            },
            {
              'items.product.variants': { $exists: false },
            },
          ],
        },
      },
      {
        $addFields: {
          itemPrice: {
            price: {
              $multiply: [
                { $ifNull: ['$items.quantity', 0] },
                {
                  $ifNull: [
                    '$items.product.variants.price.amount',
                    { $ifNull: ['$items.product.price.amount', 0] },
                  ],
                },
              ],
            },
            currency: {
              $ifNull: [
                '$items.product.variants.price.currency',
                { $ifNull: ['$items.product.price.currency', 'INR'] },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          user: { $first: '$user' },
          totalPrice: {
            $sum: '$itemPrice.price',
          },
          currency: {
            $first: '$itemPrice.currency',
          },
          items: {
            $push: {
              $cond: [
                { $ifNull: ['$items.product._id', false] },
                '$items',
                '$$REMOVE',
              ],
            },
          },
        },
      },
    ])
  )[0];

  return cart;
};

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const getCart = async (req, res) => {
  try {
    const user = req.user;
    let cart = await getCartDetails(user._id);

    if (!cart) {
      cart = await cartModel.create({
        user: user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      cart,
    });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId = null, size, colorway, quantity } = req.body;

    // Only add real, published products to the cart.
    const product = await productModel.findById(productId).lean();
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const qty = Number(quantity) || 1;
    const normalizedSize = size ? String(size).toUpperCase() : undefined;
    const normalizedColor = colorway?.name?.trim().toLowerCase() || '';

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    // The same product/size/colour/variant collapses into one line item.
    const existing = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.size || '') === (normalizedSize || '') &&
        (item.colorway?.name?.trim().toLowerCase() || '') === normalizedColor &&
        String(item.variantId || '') === String(variantId || ''),
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        variantId: variantId || null,
        size: normalizedSize,
        colorway: colorway || undefined,
        quantity: qty,
      });
    }

    await cart.save();
    return respondWithCart(res, cart._id, 'Product added to cart');
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = Number(quantity);
    await cart.save();
    return respondWithCart(res, cart._id, 'Cart updated');
  } catch (error) {
    console.error('updateCartItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart',
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart not found' });
    }

    if (!cart.items.id(itemId)) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart item not found' });
    }

    cart.items.pull(itemId);
    await cart.save();
    return respondWithCart(res, cart._id, 'Item removed from cart');
  } catch (error) {
    console.error('removeCartItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: cart || { user: req.user._id, items: [] },
    });
  } catch (error) {
    console.error('clearCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const cart = await getCartDetails(req.user._id);
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart is empty' });
    }
    const order = await createOrder(cart.totalPrice, cart.currency);

    const payment = await PaymentModel.create({
      user: req.user._id,
      amount: {
        amount: cart.totalPrice,
        currency: cart.currency || 'INR',
      },
      items: cart.items.map((item) => ({
        title: item.product?.title || '',
        productId: item.product?._id || item.product,
        variantId: item.variantId || null,
        size: item.size,
        colorway: item.colorway,
        quantity: item.quantity,
        images: item.product?.images || [],
        price: item.product?.price || { amount: 0, currency: 'INR' },
      })),
      razorpay: {
        orderId: order.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order created successfully',
      order,
      key: Config.RAZORPAY_API_KEY,
    });
  } catch (error) {
    console.error('createOrderController error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
};

export const verifyOrderController = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const payment = await PaymentModel.findOne({
    'razorpay.orderId': razorpayOrderId,
    status: 'pending',
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  const isVerified = validatePaymentVerification(
    {
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
    },
    razorpaySignature,
    Config.RAZORPAY_API_SECRET,
  );
  if (!isVerified) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
    });
  }

  payment.razorpay.paymentId = razorpayPaymentId;
  payment.razorpay.signature = razorpaySignature;
  payment.status = 'completed';
  await payment.save();

  const cart = await cartModel.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    payment,
  });
};
