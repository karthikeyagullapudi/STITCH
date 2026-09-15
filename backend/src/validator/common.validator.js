import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

// Ends a validator chain: responds 400 with every failed check.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const isValidObjectId = (label) => (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`${label} is not a valid id`);
  }
  return true;
};
