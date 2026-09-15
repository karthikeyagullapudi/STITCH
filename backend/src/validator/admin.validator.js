import mongoose from 'mongoose';
import { body, param, query } from 'express-validator';
import { validate } from './common.validator.js';

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
