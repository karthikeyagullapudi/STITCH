import mongoose from 'mongoose';
import { body, param, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const isValidObjectId = (label) => (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`${label} is not a valid id`);
  }
  return true;
};

export const addToCartValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .custom(isValidObjectId('Product id')),

  body('variantId')
    .optional({ values: 'falsy' })
    .custom(isValidObjectId('Variant id')),

  body('quantity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  validate,
];

export const updateCartItemValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item id is required')
    .bail()
    .custom(isValidObjectId('Item id')),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  validate,
];

export const cartItemParamValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item id is required')
    .bail()
    .custom(isValidObjectId('Item id')),

  validate,
];
