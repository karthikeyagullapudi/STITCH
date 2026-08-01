import cartModel from '../model/cart.model.js';
import productModel from '../model/product.model.js';

/* Populate each line item with just enough product data for the storefront. */
const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    select:
      'title slug images price compareAtPrice sku stock status category variants',
  });

// Returns the user's cart, populated and reloaded from the given saved doc.
const respondWithCart = async (res, cartId, message, status = 200) => {
  const cart = await populateCart(cartModel.findById(cartId));
  return res.status(status).json({ success: true, message, cart });
};

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const getCart = async (req, res) => {
  try {
    let cart = await populateCart(cartModel.findOne({ user: req.user._id }));
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
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
      return res.status(404).json({ success: false, message: 'Cart not found' });
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
      return res.status(404).json({ success: false, message: 'Cart not found' });
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
