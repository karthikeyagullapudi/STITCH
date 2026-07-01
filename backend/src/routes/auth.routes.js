import { Router } from 'express';
import {
  loginValidation,
  registerValidation,
} from '../validator/auth.validator.js';
import {
  userLogin,
  userRegister,
} from '../controller/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', registerValidation, userRegister);
authRouter.post('/login', loginValidation, userLogin);
authRouter.get('/me', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default authRouter;
