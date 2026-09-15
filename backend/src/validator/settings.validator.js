import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const updateSettingsValidator = [
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('shippingFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping fee must be a positive number'),
  body('freeShippingThreshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Free shipping threshold must be a positive number'),
  validate,
];
