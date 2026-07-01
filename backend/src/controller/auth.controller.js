import { Config } from '../config/config.js';
import userModel from '../model/user.model.js';
import jwt from 'jsonwebtoken';

const sendTokenResponse = async (user, res, message) => {
  const token = jwt.sign({ id: user._id }, Config.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
};

export const userRegister = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    const userExists = await userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await userModel.create(req.body);
    const createdUser = await userModel.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: createdUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist',
      });
    }

    const isPasswordValid = await user.comparePasswords(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Password',
      });
    }

    return sendTokenResponse(user, res, 'User logged in successfully');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
