import { Router } from 'express';
import { protect, authAdmin } from '../middleware/auth.middleware.js';
import {
  getOrderSummary,
  createOrderController,
  verifyOrderController,
  razorpayWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controller/order.controller.js';
import {
  orderSummaryValidator,
  checkoutValidator,
  verifyOrderValidator,
  orderIdParamValidator,
  updateOrderStatusValidator,
} from '../validator/order.validator.js';

const orderRouter = Router();

orderRouter.post('/summary', protect, orderSummaryValidator, getOrderSummary);
orderRouter.post(
  '/checkout',
  protect,
  checkoutValidator,
  createOrderController,
);
orderRouter.post(
  '/verify',
  protect,
  verifyOrderValidator,
  verifyOrderController,
);
orderRouter.post('/webhook', razorpayWebhook);

orderRouter.get('/admin/all', authAdmin, getAllOrders);
orderRouter.patch(
  '/admin/:orderId/status',
  authAdmin,
  updateOrderStatusValidator,
  updateOrderStatus,
);

orderRouter.get('/', protect, getMyOrders);
orderRouter.get('/:orderId', protect, orderIdParamValidator, getOrderById);
orderRouter.post(
  '/:orderId/cancel',
  protect,
  orderIdParamValidator,
  cancelOrder,
);

export default orderRouter;
