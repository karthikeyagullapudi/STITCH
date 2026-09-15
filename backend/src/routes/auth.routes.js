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
import passport from 'passport';
import { Config } from '../config/config.js';

const authRouter = Router();

authRouter.post('/register', registerValidation, userRegister);
authRouter.post('/login', loginValidation, userLogin);
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
);

authRouter.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

authRouter.post('/forgot-password', forgotPasswordValidation, forgotPassword);
authRouter.post(
  '/reset-password/:token',
  resetPasswordValidation,
  resetPassword,
);
authRouter.get('/verify-email/:token', tokenParamValidation, verifyEmail);
authRouter.post('/verify-email/resend', protect, resendVerificationEmail);

export default authRouter;
