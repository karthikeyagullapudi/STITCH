import express from 'express';
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

// Any localhost port is fine while developing; production only allows CLIENT_URL.
const isAllowedOrigin = (origin) =>
  origin === Config.CLIENT_URL ||
  (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

app.use(helmet());
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

app.use(notFound);
app.use(errorHandler);

export default app;
