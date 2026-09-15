import mongoose from 'mongoose';
import { body, param } from 'express-validator';
import { validate } from './common.validator.js';

const requiredText = (field, label) =>
  body(field).trim().notEmpty().withMessage(`${label} is required`);

export const updateProfileValidator = [
  body('name.firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('name.lastName').optional().trim(),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits long'),
  validate,
];

export const changePasswordValidator = [
  body('currentPassword').optional().isString(),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate,
];

export const addressValidator = [
  requiredText('fullName', 'Full name'),
  requiredText('phone', 'Phone number')
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 digits long'),
  requiredText('line1', 'Address line 1'),
  body('line2').optional().trim(),
  requiredText('city', 'City'),
  requiredText('state', 'State'),
  requiredText('postalCode', 'Postal code'),
  body('country').optional().trim(),
  body('isDefault').optional().isBoolean(),
  validate,
];

export const addressIdParamValidator = [
  param('addressId')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Address id is not a valid id'),
  validate,
];

export const verifyPhoneOtpValidator = [
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Enter the 6-digit code'),
  validate,
];
