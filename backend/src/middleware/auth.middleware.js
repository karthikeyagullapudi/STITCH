import jwt from 'jsonwebtoken';
import { Config } from '../config/config.js';
import userModel from '../model/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, Config.JWT_SECRET);

    // Get user from database (excluding password)
    req.user = await userModel.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }
    if (!req.user.status) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message,
    });
  }
};

const requireApprovedAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized, user is not an admin',
    });
  }
  if (!req.user.adminApproved) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized, admin account is pending approval',
    });
  }
  next();
};

// Signed in (via `protect`) and an approved admin. Express runs both in order.
export const authAdmin = [protect, requireApprovedAdmin];
