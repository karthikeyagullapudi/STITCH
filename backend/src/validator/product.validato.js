import { body, validationResult } from 'express-validator';
import { PRODUCT_STATUS, CURRENCIES } from '../model/product.model.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createProductValidator = [
  /* ---- General ---- */
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string'),

  body('slug').optional({ values: 'falsy' }).isString().withMessage('Slug must be a string'),

  /* ---- Pricing ---- */
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('currency')
    .optional({ values: 'falsy' })
    .isIn(CURRENCIES)
    .withMessage(`Currency must be one of: ${CURRENCIES.join(', ')}`),

  body('compareAtPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Compare-at price must be a positive number'),

  body('costPerItem')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Cost per item must be a positive number'),

  /* ---- Inventory ---- */
  body('sku').optional({ values: 'falsy' }).isString().withMessage('SKU must be a string'),

  body('stock')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  /* ---- Organization ---- */
  body('category').optional({ values: 'falsy' }).isString(),
  body('collection').optional({ values: 'falsy' }).isString(),
  body('collectionName').optional({ values: 'falsy' }).isString(),
  body('vendor').optional({ values: 'falsy' }).isString(),

  /* ---- Publish status ---- */
  body('status')
    .optional({ values: 'falsy' })
    .isIn(PRODUCT_STATUS)
    .withMessage(`Status must be one of: ${PRODUCT_STATUS.join(', ')}`),

  /* ---- Media ---- */
  body('images').custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error('At least one product image is required');
    }
    return true;
  }),

  validate,
];
