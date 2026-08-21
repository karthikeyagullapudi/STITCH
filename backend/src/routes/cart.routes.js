import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrderController,
  verifyOrderController,
} from '../controller/cart.controller.js';
import {
  addToCartValidator,
  updateCartItemValidator,
  cartItemParamValidator,
} from '../validator/cart.validator.js';

const cartRouter = Router();

cartRouter.get('/', protect, getCart);
cartRouter.post('/add', protect, addToCartValidator, addToCart);
cartRouter.delete('/clear', protect, clearCart);
cartRouter.patch(
  '/item/:itemId',
  protect,
  updateCartItemValidator,
  updateCartItem,
);
cartRouter.delete(
  '/item/:itemId',
  protect,
  cartItemParamValidator,
  removeCartItem,
);
cartRouter.post('/payment/create/order', protect, createOrderController);
cartRouter.post('/payment/verify/order', protect, verifyOrderController);

export default cartRouter;
