import { body, param } from 'express-validator';
import { validate, isValidObjectId } from './common.validator.js';

const couponCode = body('couponCode')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('Promo code must be text')
  .trim();

export const orderSummaryValidator = [couponCode, validate];

export const checkoutValidator = [
  body('addressId')
    .notEmpty()
    .withMessage('Choose a shipping address')
    .bail()
    .custom(isValidObjectId('Address id')),
  couponCode,
  validate,
];

export const verifyOrderValidator = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order id is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .withMessage('Razorpay payment id is required'),
  body('razorpaySignature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),

  validate,
];

export const orderIdParamValidator = [
  param('orderId').custom(isValidObjectId('Order id')),
  validate,
];

export const updateOrderStatusValidator = [
  param('orderId').custom(isValidObjectId('Order id')),
  body('status')
    .isIn(['shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be shipped, delivered or cancelled'),
  validate,
];
