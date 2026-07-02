import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Config } from './config/config.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
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
    }
  )
);

app.use('/api/auth', authRouter);
export default app;
