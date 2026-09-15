import cartModel from '../model/cart.model.js';
import productModel from '../model/product.model.js';
import mongoose from 'mongoose';

// Responds with the user's cart, reloaded through the pricing aggregation.
const respondWithCart = async (res, userId, message, status = 200) => {
  const cart = await getCartDetails(userId);
  return res.status(status).json({ success: true, message, cart });
};

// Also used by checkout to price the bag.
export const getCartDetails = async (userId) => {
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
      // Keep only the line item's selected variant (none when variantId is
      // unset or the variant was deleted, so pricing falls back to the product).
      {
        $addFields: {
          'items.product.variants': {
            $filter: {
              input: { $ifNull: ['$items.product.variants', []] },
              as: 'variant',
              cond: { $eq: ['$$variant._id', '$items.variantId'] },
            },
          },
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
                    {
                      $arrayElemAt: ['$items.product.variants.price.amount', 0],
                    },
                    { $ifNull: ['$items.product.price.amount', 0] },
                  ],
                },
              ],
            },
            currency: {
              $ifNull: [
                {
                  $arrayElemAt: ['$items.product.variants.price.currency', 0],
                },
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

// The most of any one item a single order line can hold.
const MAX_LINE_QUANTITY = 10;

// Why this quantity of a product/variant can't be bought, or null if it can.
const getQuantityError = (product, variant, quantity) => {
  if (quantity > MAX_LINE_QUANTITY) {
    return `You can buy up to ${MAX_LINE_QUANTITY} of each item`;
  }
  const stock = variant ? variant.stock : product.stock;
  if (product.trackQuantity && quantity > stock) {
    return stock > 0 ? `Only ${stock} left in stock` : 'This item is out of stock';
  }
  return null;
};

/* Adds a product to a user's cart after checking it can be bought. Size and
   colour always come from the chosen variant, never from the client. Pass a
   session to run it inside a transaction. Resolves to { error, status } when
   the line can't be added. */
export const addLineToCart = async (
  { userId, productId, variantId, quantity },
  session = null,
) => {
  const product = await productModel.findById(productId).session(session).lean();
  if (!product || product.status !== 'active') {
    return { status: 404, error: 'Product not found' };
  }

  const variant = product.variants.find(
    (v) => String(v._id) === String(variantId),
  );
  if (product.variants.length > 0 && !variant) {
    return { status: 400, error: 'Choose a size and colour first' };
  }

  const cart =
    (await cartModel.findOne({ user: userId }).session(session)) ||
    new cartModel({ user: userId, items: [] });

  // The same product + variant collapses into one line item.
  const existing = cart.items.find(
    (item) =>
      String(item.product) === String(productId) &&
      String(item.variantId || '') === String(variant?._id || ''),
  );
  const nextQuantity = (existing?.quantity || 0) + quantity;
  const quantityError = getQuantityError(product, variant, nextQuantity);
  if (quantityError) return { status: 400, error: quantityError };

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({
      product: productId,
      variantId: variant?._id || null,
      size: variant?.size,
      colorway: variant?.colorway
        ? { name: variant.colorway.name, hex: variant.colorway.hex }
        : undefined,
      quantity,
    });
  }

  await cart.save({ session });
  return { cart };
};

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const getCart = async (req, res) => {
  try {
    const exists = await cartModel.exists({ user: req.user._id });
    if (!exists) await cartModel.create({ user: req.user._id, items: [] });
    return respondWithCart(res, req.user._id, 'Cart fetched successfully');
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
    const { productId, variantId, quantity } = req.body;
    const result = await addLineToCart({
      userId: req.user._id,
      productId,
      variantId,
      quantity: Number(quantity) || 1,
    });
    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }
    return respondWithCart(res, req.user._id, 'Product added to cart');
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
    const quantity = Number(req.body.quantity);

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

    const product = await productModel.findById(item.product).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    const variant = product.variants.find(
      (v) => String(v._id) === String(item.variantId),
    );
    const quantityError = getQuantityError(product, variant, quantity);
    if (quantityError) {
      return res.status(400).json({ success: false, message: quantityError });
    }

    item.quantity = quantity;
    await cart.save();
    return respondWithCart(res, req.user._id, 'Cart updated');
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
    return respondWithCart(res, req.user._id, 'Item removed from cart');
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
    await cartModel.updateOne(
      { user: req.user._id },
      { $set: { items: [] } },
      { upsert: true },
    );
    return respondWithCart(res, req.user._id, 'Cart cleared');
  } catch (error) {
    console.error('clearCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};
