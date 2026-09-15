import { body } from 'express-validator';
import { validate } from './common.validator.js';

export const subscribeValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  validate,
];
