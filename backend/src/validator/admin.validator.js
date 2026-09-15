import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userIdParam = param('userId')
  .custom((value) => mongoose.Types.ObjectId.isValid(value))
  .withMessage('User id is not a valid id');

export const analyticsValidator = [
  query('days')
    .optional()
    .isIn(['7', '30', '90'])
    .withMessage('Range must be 7, 30 or 90 days'),
  validate,
];

export const customerStatusValidator = [
  userIdParam,
  body('status').isBoolean().withMessage('Status must be a boolean'),
  validate,
];

export const adminApprovalValidator = [
  userIdParam,
  body('approved').isBoolean().withMessage('Approved must be a boolean'),
  validate,
];
