import express from 'express';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Config } from './config/config.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import userRouter from './routes/user.routes.js';
import newsletterRouter from './routes/newsletter.routes.js';
import orderRouter from './routes/order.routes.js';
import couponRouter from './routes/coupon.routes.js';
import settingsRouter from './routes/settings.routes.js';
import adminRouter from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();
const isProduction = Config.NODE_ENV === 'production';
// The built storefront, served by this app in production (one domain for both).
const clientDist = fileURLToPath(new URL('../../frontend/dist', import.meta.url));

// On Render, requests pass through Cloudflare and Render's load balancer.
// Trusting both hops makes req.ip the visitor's address (used by rate limits).
if (isProduction) app.set('trust proxy', 2);

// Any localhost port is fine while developing; production only allows CLIENT_URL.
const isAllowedOrigin = (origin) =>
  origin === Config.CLIENT_URL ||
  (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

// Razorpay Checkout spans several razorpay.com origins: its script, an iframe,
// API calls, and a form POST carrying the payment result back. Helmet fills any
// directive left unset from its own defaults, so each one has to be named here.
const RAZORPAY = 'https://*.razorpay.com';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Product photos and avatars come from several image hosts.
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", RAZORPAY],
        frameSrc: ["'self'", RAZORPAY],
        childSrc: ["'self'", RAZORPAY],
        connectSrc: ["'self'", RAZORPAY],
        formAction: ["'self'", RAZORPAY],
        workerSrc: ["'self'", 'blob:'],
      },
    },
    // Checkout reads the result back through window.opener; the default
    // 'same-origin' severs that and the payment window never resolves.
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      const error = new Error('Not allowed by CORS');
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(
  express.json({
    // Razorpay webhooks are signed over the exact raw body.
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: Config.GOOGLE_CLIENT_ID,
      clientSecret: Config.GOOGLE_CLIENT_SECRET,
      callbackURL: Config.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    },
  ),
);

app.get('/api/health', (req, res) =>
  res.status(200).json({ success: true, status: 'ok' }),
);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/users', userRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/orders', orderRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

// Storefront: static assets, then index.html for every client-side route.
if (isProduction && existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    return res.sendFile('index.html', { root: clientDist });
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
