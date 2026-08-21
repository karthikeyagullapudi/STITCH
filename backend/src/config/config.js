import { config } from 'dotenv';

config();

if (!process.env.PORT) {
  throw new Error('PORT is not defined');
}

if (!process.env.DB_URI) {
  throw new Error('DB_URI is not defined');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is not defined');
}

if (!process.env.GOOGLE_CALLBACK_URL) {
  throw new Error('GOOGLE_CALLBACK_URL is not defined');
}

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV is not defined');
}

if (!process.env.IMAGEKIT_PRIVATE_KEY && !process.env.IMAGE_KIT_PRIVATE_KEY) {
  throw new Error('IMAGEKIT_PRIVATE_KEY is not defined');
}

if (!process.env.RAZORPAY_API_KEY) {
  throw new Error('RAZORPAY_API_KEY is not defined');
}

if (!process.env.RAZORPAY_API_SECRET) {
  throw new Error('RAZORPAY_API_SECRET is not defined');
}

export const Config = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  IMAGEKIT_PRIVATE_KEY:
    process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGE_KIT_PRIVATE_KEY,
  RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY,
  RAZORPAY_API_SECRET: process.env.RAZORPAY_API_SECRET,
};
