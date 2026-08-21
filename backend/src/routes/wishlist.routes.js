import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  addToWishlistValidator,
  updateWishlistItemValidator,
  wishlistItemParamValidator,
  wishlistProductParamValidator,
  moveToCartValidator,
} from '../validator/wishlist.validator.js';
import {
  addToWishlist,
  updateWishlistItem,
  removeWishlistItem,
  getWishlist,
  getWishlistProduct,
  moveToCart,
} from '../controller/wishlist.controller.js';

const router = Router();

// Add to wishlist
router.post('/add', protect, addToWishlistValidator, addToWishlist);

// Update wishlist item
router.put(
  '/update/:itemId',
  protect,
  updateWishlistItemValidator,
  updateWishlistItem,
);

// Remove from wishlist
router.delete(
  '/remove/:itemId',
  protect,
  wishlistItemParamValidator,
  removeWishlistItem,
);

// Get wishlist
router.get('/', protect, getWishlist);

// Get wishlist product
router.get(
  '/product/:productId',
  protect,
  wishlistProductParamValidator,
  getWishlistProduct,
);

// Move to cart
router.post('/move-to-cart/:itemId', protect, moveToCartValidator, moveToCart);

export default router;
