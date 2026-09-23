import { Router } from 'express';
import {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  tokenParamValidation,
} from '../validator/auth.validator.js';
import {
  userLogin,
  userRegister,
  userLogout,
  googleAuthCallBack,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../controller/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import passport from 'passport';
import { Config } from '../config/config.js';

const authRouter = Router();

authRouter.post('/register', authLimiter, registerValidation, userRegister);
authRouter.post('/login', authLimiter, loginValidation, userLogin);
authRouter.post('/logout', userLogout);
authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${Config.CLIENT_URL}/login`,
  }),
  googleAuthCallBack,
  // Google rejects expired or reused codes (e.g. a refreshed callback page);
  // send the user back to sign in instead of showing a server error.
  // Express only treats it as an error handler because it takes 4 args.
  (error, req, res, next) => {
    console.error('Google Auth Error:', error.message);
    res.redirect(`${Config.CLIENT_URL}/login?error=google_auth_failed`);
  },
);

authRouter.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

authRouter.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  forgotPassword,
);
authRouter.post(
  '/reset-password/:token',
  authLimiter,
  resetPasswordValidation,
  resetPassword,
);
authRouter.get('/verify-email/:token', tokenParamValidation, verifyEmail);
authRouter.post(
  '/verify-email/resend',
  authLimiter,
  protect,
  resendVerificationEmail,
);

export default authRouter;
