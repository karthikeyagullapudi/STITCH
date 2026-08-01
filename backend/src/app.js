import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Config } from './config/config.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';

const app = express();

const allowedOrigins = [
  Config.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
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
export default app;
