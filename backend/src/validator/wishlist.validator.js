import mongoose from 'mongoose';
import { body, param, validationResult } from 'express-validator';
import { SIZES } from '../model/product.model.js';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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

const isValidColorway = (colorway) => {
  if (typeof colorway !== 'object' || Array.isArray(colorway)) {
    throw new Error('Colorway must be an object');
  }
  if (typeof colorway.name !== 'string' || !colorway.name.trim()) {
    throw new Error('Colorway name is required');
  }
  if (colorway.hex !== undefined && !HEX_COLOR.test(colorway.hex)) {
    throw new Error('Colorway hex must be a valid color');
  }
  return true;
};

export const addToWishlistValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .custom(isValidObjectId('Product id')),

  body('variantId')
    .optional({ values: 'falsy' })
    .custom(isValidObjectId('Variant id')),

  body('size')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => String(value).trim().toUpperCase())
    .isIn(SIZES)
    .withMessage(`Size must be one of: ${SIZES.join(', ')}`),

  body('colorway').optional({ values: 'falsy' }).custom(isValidColorway),

  validate,
];

export const updateWishlistItemValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item id is required')
    .bail()
    .custom(isValidObjectId('Item id')),

  body().custom((payload) => {
    const updatable = ['variantId', 'size', 'colorway'];
    if (!updatable.some((field) => payload?.[field] !== undefined)) {
      throw new Error(`Provide at least one of: ${updatable.join(', ')}`);
    }
    return true;
  }),

  body('variantId')
    .optional({ values: 'falsy' })
    .custom(isValidObjectId('Variant id')),

  body('size')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => String(value).trim().toUpperCase())
    .isIn(SIZES)
    .withMessage(`Size must be one of: ${SIZES.join(', ')}`),

  body('colorway').optional({ values: 'falsy' }).custom(isValidColorway),

  validate,
];

export const wishlistItemParamValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item id is required')
    .bail()
    .custom(isValidObjectId('Item id')),

  validate,
];

export const wishlistProductParamValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .custom(isValidObjectId('Product id')),

  validate,
];

export const moveToCartValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item id is required')
    .bail()
    .custom(isValidObjectId('Item id')),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  validate,
];
