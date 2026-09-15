import wishlistModel from '../model/wishlist.model.js';
import productModel from '../model/product.model.js';
import mongoose from 'mongoose';
import { sendEmail } from '../services/email.services.js';
import { Config } from '../config/config.js';
import { addLineToCart } from './cart.controller.js';

/* Populate each saved item with just enough product data for the storefront. */
const populateWishlist = (query) =>
  query.populate({
    path: 'items.product',
    select:
      'title slug images price compareAtPrice sku stock trackQuantity status category variants',
  });

// Whether the saved variant (or the product, if none was chosen) can be bought.
const isAvailable = (product, variantId) => {
  if (product.status !== 'active') return false;
  if (!product.trackQuantity) return true;
  const variant =
    variantId &&
    product.variants.find((v) => String(v._id) === String(variantId));
  return (variant ? variant.stock : product.stock) > 0;
};

/* Emails shoppers who asked to hear when a saved product is back in stock,
   then clears their request. Called whenever a product's stock can rise. */
export const notifyBackInStock = async (productId) => {
  const product = await productModel.findById(productId).lean();
  if (!product) return;

  const wishlists = await wishlistModel
    .find({ items: { $elemMatch: { product: productId, notifyMe: true } } })
    .populate('user', 'email name');

  await Promise.all(
    wishlists.map(async (wishlist) => {
      const ready = wishlist.items.filter(
        (item) =>
          item.notifyMe &&
          String(item.product) === String(productId) &&
          isAvailable(product, item.variantId),
      );
      if (ready.length === 0 || !wishlist.user) return;

      await sendEmail({
        to: wishlist.user.email,
        subject: `${product.title} is back in stock`,
        html: `<p>Hi ${wishlist.user.name.firstName},</p>
          <p>Good news — <strong>${product.title}</strong> from your wishlist is available again.</p>
          <p><a href="${Config.CLIENT_URL}/product/${product.slug}">Shop it now</a></p>`,
      });
      ready.forEach((item) => {
        item.notifyMe = false;
      });
      await wishlist.save();
    }),
  );
};

// Reloads the wishlist after a write so the client always gets populated items.
const respondWithWishlist = async (res, wishlistId, message, status = 200) => {
  const wishlist = await populateWishlist(wishlistModel.findById(wishlistId));
  return res.status(status).json({ success: true, message, wishlist });
};

// One wishlist per user — create lazily on first use.
const findOrCreateWishlist = async (userId) => {
  const existing = await wishlistModel.findOne({ user: userId });
  if (existing) return existing;
  return wishlistModel.create({ user: userId, items: [] });
};

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await populateWishlist(
      wishlistModel.findOne({ user: req.user._id }),
    );
    if (!wishlist) {
      wishlist = await wishlistModel.create({ user: req.user._id, items: [] });
    }
    return res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      wishlist,
    });
  } catch (error) {
    console.error('getWishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId, variantId = null, size, colorway } = req.body;

    // Only save real, published products.
    const product = await productModel.findById(productId).lean();
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const wishlist = await findOrCreateWishlist(req.user._id);

    if (wishlist.items.length >= 100) {
      return res.status(409).json({
        success: false,
        message: 'A wishlist cannot hold more than 100 items',
      });
    }

    // A wishlist holds one entry per product, so the atomic guard below only
    // pushes when the product is absent. Doing this as a single conditional
    // update (rather than find-then-save) keeps a double-click from inserting
    // the item twice.
    const result = await wishlistModel.updateOne(
      { _id: wishlist._id, 'items.product': { $ne: productId } },
      {
        $push: {
          items: {
            product: productId,
            variantId: variantId || null,
            size: size ? String(size).toUpperCase() : undefined,
            colorway: colorway || undefined,
          },
        },
      },
    );

    return respondWithWishlist(
      res,
      wishlist._id,
      result.modifiedCount
        ? 'Product saved to wishlist'
        : 'Product is already in your wishlist',
    );
  } catch (error) {
    console.error('addToWishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save product to wishlist',
    });
  }
};

export const updateWishlistItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { variantId, size, colorway, notifyMe } = req.body;

    const wishlist = await wishlistModel.findOne({ user: req.user._id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist not found' });
    }

    const item = wishlist.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist item not found' });
    }

    // Only touch what the client actually sent; an explicit null clears.
    if (variantId !== undefined) item.variantId = variantId || null;
    if (size !== undefined) item.size = size ? String(size).toUpperCase() : undefined;
    if (colorway !== undefined) item.colorway = colorway || undefined;
    if (notifyMe !== undefined) item.notifyMe = notifyMe;

    await wishlist.save();
    return respondWithWishlist(
      res,
      wishlist._id,
      notifyMe === undefined
        ? 'Wishlist item updated'
        : notifyMe
          ? "We'll email you when it's back in stock"
          : 'Back-in-stock alert turned off',
    );
  } catch (error) {
    console.error('updateWishlistItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update wishlist item',
    });
  }
};

export const removeWishlistItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const wishlist = await wishlistModel.findOne({ user: req.user._id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist not found' });
    }

    if (!wishlist.items.id(itemId)) {
      return res
        .status(404)
        .json({ success: false, message: 'Wishlist item not found' });
    }

    wishlist.items.pull(itemId);
    await wishlist.save();
    return respondWithWishlist(res, wishlist._id, 'Item removed from wishlist');
  } catch (error) {
    console.error('removeWishlistItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
    });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await findOrCreateWishlist(req.user._id);
    wishlist.items = [];
    await wishlist.save();
    return respondWithWishlist(res, wishlist._id, 'Wishlist cleared');
  } catch (error) {
    console.error('clearWishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
    });
  }
};

/* Backs the heart toggle: reports whether a product is saved, and returns the
   saved item's id so the client can unsave without a second lookup. */
export const getWishlistProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await wishlistModel
      .findOne({ user: req.user._id })
      .select('items')
      .lean();

    const item = (wishlist?.items || []).find(
      (saved) => String(saved.product) === String(productId),
    );

    return res.status(200).json({
      success: true,
      message: item ? 'Product is in wishlist' : 'Product is not in wishlist',
      saved: Boolean(item),
      item: item || null,
    });
  } catch (error) {
    console.error('getWishlistProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
    });
  }
};

/* "Move to Bag" — adds the saved item (and its variant) to the cart and drops
   it from the wishlist in one transaction, so neither write happens alone. */
export const moveToCart = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { itemId } = req.params;
    let result;

    await session.withTransaction(async () => {
      const wishlist = await wishlistModel
        .findOne({ user: req.user._id })
        .session(session);
      const item = wishlist?.items.id(itemId);
      if (!item) {
        result = { status: 404, error: 'Wishlist item not found' };
        return;
      }

      result = await addLineToCart(
        {
          userId: req.user._id,
          productId: item.product,
          variantId: item.variantId,
          quantity: Number(req.body.quantity) || 1,
        },
        session,
      );
      if (result.error) return;

      wishlist.items.pull(itemId);
      await wishlist.save({ session });
      result.wishlistId = wishlist._id;
    });

    if (result.error) {
      return res
        .status(result.status)
        .json({ success: false, message: result.error });
    }
    return respondWithWishlist(res, result.wishlistId, 'Moved to your bag');
  } catch (error) {
    console.error('moveToCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to move item to cart',
    });
  } finally {
    await session.endSession();
  }
};
