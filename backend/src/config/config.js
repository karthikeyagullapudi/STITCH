import { config } from 'dotenv';

config();

// Render sets this to the service's public URL (e.g. https://stitch.onrender.com).
// When the storefront is served by this same service it's the right default
// for the client URL and the Google callback.
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL;
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  (PUBLIC_URL && `${PUBLIC_URL}/api/auth/google/callback`);

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

if (!GOOGLE_CALLBACK_URL) {
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
  GOOGLE_CALLBACK_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || PUBLIC_URL || 'http://localhost:5173',
  // 'lax' when the storefront shares this domain; 'none' if it's hosted elsewhere.
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  IMAGEKIT_PRIVATE_KEY:
    process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGE_KIT_PRIVATE_KEY,
  RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY,
  RAZORPAY_API_SECRET: process.env.RAZORPAY_API_SECRET,

  // Optional — webhook events are rejected until this is set.
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

  // Optional — without these, emails and SMS are printed to the console.
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'STITCH <no-reply@stitch.local>',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};
