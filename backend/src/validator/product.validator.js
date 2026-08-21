import mongoose from 'mongoose';
import { body, param, validationResult } from 'express-validator';
import {
  PRODUCT_STATUS,
  CURRENCIES,
  SIZES,
  GENDERS,
} from '../model/product.model.js';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const parseJson = (value) => {
  if (value === undefined || value === null || value === '') return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseToArray = (value) => {
  if (value === undefined || value === null || value === '') return value;
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'object') return [parsed];
  return String(parsed)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const isPresent = (value) =>
  value !== undefined && value !== null && value !== '';

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertColorway = (colorway, label) => {
  if (!isPlainObject(colorway)) {
    throw new Error(`${label}: colorway must be an object with a name and hex`);
  }
  if (typeof colorway.name !== 'string' || !colorway.name.trim()) {
    throw new Error(`${label}: colorway name is required`);
  }
  if (
    typeof colorway.hex !== 'string' ||
    !HEX_COLOR.test(colorway.hex.trim())
  ) {
    throw new Error(
      `${label}: colorway hex must be a valid colour, e.g. #1A1A1A`,
    );
  }
};

const assertPrice = (price, label) => {
  if (!isPlainObject(price)) {
    throw new Error(`${label}: price must be an object with an amount`);
  }
  const amount = Number(price.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label}: price amount must be a positive number`);
  }
  if (isPresent(price.currency) && !CURRENCIES.includes(price.currency)) {
    throw new Error(
      `${label}: price currency must be one of ${CURRENCIES.join(', ')}`,
    );
  }
};

const assertVariantList = (variants, { reservedSkus = [] } = {}) => {
  if (!Array.isArray(variants)) {
    throw new Error(
      typeof variants === 'string'
        ? 'Variants must be a valid JSON array'
        : 'Variants must be an array',
    );
  }

  const seenCombos = new Set();
  const seenSkus = new Set(
    reservedSkus.filter(Boolean).map((s) => String(s).trim().toUpperCase()),
  );

  variants.forEach((variant, index) => {
    const label = `Variant ${index + 1}`;

    if (!isPlainObject(variant)) {
      throw new Error(`${label} must be an object`);
    }

    const { size, colorway, sku, stock, price, images } = variant;

    if (!isPresent(size)) {
      throw new Error(`${label}: size is required`);
    }
    const normalizedSize = String(size).trim().toUpperCase();
    if (!SIZES.includes(normalizedSize)) {
      throw new Error(`${label}: size must be one of ${SIZES.join(', ')}`);
    }

    assertColorway(colorway, label);

    const combo = `${normalizedSize}::${colorway.name.trim().toLowerCase()}`;
    if (seenCombos.has(combo)) {
      throw new Error(
        `${label}: duplicate variant for size ${normalizedSize} in ${colorway.name.trim()}`,
      );
    }
    seenCombos.add(combo);

    if (isPresent(sku)) {
      if (typeof sku !== 'string') {
        throw new Error(`${label}: sku must be a string`);
      }
      const normalizedSku = sku.trim().toUpperCase();
      if (seenSkus.has(normalizedSku)) {
        throw new Error(`${label}: duplicate SKU ${normalizedSku}`);
      }
      seenSkus.add(normalizedSku);
    }

    if (isPresent(stock)) {
      const quantity = Number(stock);
      if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error(`${label}: stock must be a non-negative integer`);
      }
    }

    if (isPresent(price)) {
      assertPrice(price, label);
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        throw new Error(`${label}: images must be an array`);
      }
      images.forEach((image) => {
        if (
          !isPlainObject(image) ||
          typeof image.url !== 'string' ||
          !image.url.trim()
        ) {
          throw new Error(`${label}: every image needs a url`);
        }
      });
    }
  });

  return true;
};

export const createProductValidator = [
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

  body('slug')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Slug must be a string'),

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

  body('chargeTax')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('Charge tax must be a boolean'),

  body('sku')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('SKU must be a string'),

  body('stock')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('trackQuantity')
    .optional({ values: 'falsy' })
    .isBoolean()
    .withMessage('Track quantity must be a boolean'),

  body('variants')
    .optional({ values: 'falsy' })
    .customSanitizer(parseJson)
    .custom((variants, { req }) =>
      assertVariantList(variants, { reservedSkus: [req.body.sku] }),
    ),

  body('sizes')
    .optional({ values: 'falsy' })
    .customSanitizer(parseToArray)
    .custom((sizes) => {
      if (!Array.isArray(sizes)) throw new Error('Sizes must be an array');
      sizes.forEach((size) => {
        if (!SIZES.includes(String(size).trim().toUpperCase())) {
          throw new Error(`Size must be one of: ${SIZES.join(', ')}`);
        }
      });
      return true;
    }),

  body('colorways')
    .optional({ values: 'falsy' })
    .customSanitizer(parseToArray)
    .custom((colorways) => {
      if (!Array.isArray(colorways)) {
        throw new Error('Colorways must be an array');
      }
      const seen = new Set();
      colorways.forEach((colorway, index) => {
        const label = `Colorway ${index + 1}`;
        assertColorway(colorway, label);
        const name = colorway.name.trim().toLowerCase();
        if (seen.has(name)) {
          throw new Error(
            `${label}: duplicate colorway ${colorway.name.trim()}`,
          );
        }
        seen.add(name);
      });
      return true;
    }),

  body('gender')
    .optional({ values: 'falsy' })
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

  body('category').optional({ values: 'falsy' }).isString(),
  body('collection').optional({ values: 'falsy' }).isString(),
  body('collectionName').optional({ values: 'falsy' }).isString(),
  body('vendor').optional({ values: 'falsy' }).isString(),

  body('tags')
    .optional({ values: 'falsy' })
    .customSanitizer(parseToArray)
    .custom((tags) => {
      if (!Array.isArray(tags)) throw new Error('Tags must be an array');
      tags.forEach((tag) => {
        if (typeof tag !== 'string' && typeof tag !== 'number') {
          throw new Error('Every tag must be a string');
        }
      });
      return true;
    }),

  body('status')
    .optional({ values: 'falsy' })
    .isIn(PRODUCT_STATUS)
    .withMessage(`Status must be one of: ${PRODUCT_STATUS.join(', ')}`),

  body('images').custom((value, { req }) => {
    const productImages = (req.files || []).filter(
      (file) => file.fieldname === 'images',
    );
    if (productImages.length === 0) {
      throw new Error('At least one product image is required');
    }
    return true;
  }),

  validate,
];

export const addProductVariantsValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .custom((productId) => {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Product id is not a valid id');
      }
      return true;
    }),

  body('variants')
    .notEmpty()
    .withMessage('At least one variant is required')
    .bail()
    .customSanitizer(parseToArray)
    .custom((variants) => {
      assertVariantList(variants);
      if (variants.length === 0) {
        throw new Error('At least one variant is required');
      }
      return true;
    }),

  validate,
];
