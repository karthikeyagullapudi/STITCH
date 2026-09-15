import { body, param } from 'express-validator';
import { validate, isValidObjectId } from './common.validator.js';

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
