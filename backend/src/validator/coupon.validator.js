import mongoose from 'mongoose';
import { body, param } from 'express-validator';
import { COUPON_TYPES } from '../model/coupon.model.js';
import { validate } from './common.validator.js';

// Create requires code/type/value; update accepts any subset.
const couponFields = (isUpdate) => {
  const required = (field) =>
    isUpdate
      ? body(field).optional()
      : body(field).exists().withMessage(`${field} is required`).bail();

  return [
    required('code')
      .trim()
      .matches(/^[A-Za-z0-9_-]{3,30}$/)
      .withMessage('Code must be 3–30 letters, numbers, - or _'),
    required('type')
      .isIn(COUPON_TYPES)
      .withMessage(`Type must be one of: ${COUPON_TYPES.join(', ')}`),
    required('value')
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number')
      .bail()
      .custom((value, { req }) => {
        if (req.body.type === 'percentage' && Number(value) > 100) {
          throw new Error('A percentage discount cannot exceed 100');
        }
        return true;
      }),
    body('minOrderAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be a positive number'),
    body('maxDiscount')
      .optional({ values: 'null' })
      .isFloat({ min: 0 })
      .withMessage('Max discount must be a positive number'),
    body('expiresAt')
      .optional({ values: 'null' })
      .isISO8601()
      .withMessage('Expiry must be a valid date'),
    body('usageLimit')
      .optional({ values: 'null' })
      .isInt({ min: 1 })
      .withMessage('Usage limit must be at least 1'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  ];
};

const couponIdParam = param('couponId')
  .custom((value) => mongoose.Types.ObjectId.isValid(value))
  .withMessage('Coupon id is not a valid id');

export const createCouponValidator = [...couponFields(false), validate];

export const updateCouponValidator = [
  couponIdParam,
  ...couponFields(true),
  validate,
];

export const couponIdParamValidator = [couponIdParam, validate];
