import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware.js';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controller/coupon.controller.js';
import {
  createCouponValidator,
  updateCouponValidator,
  couponIdParamValidator,
} from '../validator/coupon.validator.js';

const couponRouter = Router();

couponRouter.get('/', authAdmin, getCoupons);
couponRouter.post('/', authAdmin, createCouponValidator, createCoupon);
couponRouter.patch('/:couponId', authAdmin, updateCouponValidator, updateCoupon);
couponRouter.delete(
  '/:couponId',
  authAdmin,
  couponIdParamValidator,
  deleteCoupon,
);

export default couponRouter;
