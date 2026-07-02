import { Router } from 'express';
import {
  loginValidation,
  registerValidation,
} from '../validator/auth.validator.js';
import {
  userLogin,
  userRegister,
  googleAuthCallBack,
} from '../controller/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import passport from 'passport';
import { Config } from '../config/config.js';

const authRouter = Router();

authRouter.post('/register', registerValidation, userRegister);
authRouter.post('/login', loginValidation, userLogin);
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
    failureRedirect: 'http://localhost:5173/login',
  }),
  googleAuthCallBack,
);

authRouter.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default authRouter;
