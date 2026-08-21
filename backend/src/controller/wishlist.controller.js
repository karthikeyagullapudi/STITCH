import wishlistModel from '../model/wishlist.model.js';
import productModel from '../model/product.model.js';
import cartModel from '../model/cart.model.js';

/* Populate each saved item with just enough product data for the storefront. */
const populateWishlist = (query) =>
  query.populate({
    path: 'items.product',
    select:
      'title slug images price compareAtPrice sku stock status category variants',
  });

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
    const { variantId, size, colorway } = req.body;

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

    await wishlist.save();
    return respondWithWishlist(res, wishlist._id, 'Wishlist item updated');
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

/* "Move to Bag" — copies the saved item (and its variant) into the cart, then
   drops it from the wishlist. */
export const moveToCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

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

    const product = await productModel.findById(item.product).lean();
    if (!product || product.status !== 'active') {
      return res
        .status(404)
        .json({ success: false, message: 'Product is no longer available' });
    }

    const qty = Number(quantity) || 1;
    const normalizedSize = item.size ? String(item.size).toUpperCase() : undefined;
    const normalizedColor = item.colorway?.name?.trim().toLowerCase() || '';

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    // Collapse onto an existing line item, matching addToCart's rules.
    const existing = cart.items.find(
      (line) =>
        line.product.toString() === String(item.product) &&
        (line.size || '') === (normalizedSize || '') &&
        (line.colorway?.name?.trim().toLowerCase() || '') === normalizedColor &&
        String(line.variantId || '') === String(item.variantId || ''),
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: item.product,
        variantId: item.variantId || null,
        size: normalizedSize,
        colorway: item.colorway || undefined,
        quantity: qty,
      });
    }

    await cart.save();

    wishlist.items.pull(itemId);
    await wishlist.save();

    return respondWithWishlist(res, wishlist._id, 'Moved to your bag');
  } catch (error) {
    console.error('moveToCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to move item to cart',
    });
  }
};
