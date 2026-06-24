import { Router } from 'express';
import {
  loginValidation,
  registerValidation,
} from '../validator/auth.validator';
import { userLogin } from '../controller/auth.controller';

const authRouter = Router();

authRouter.post('/register', registerValidation, userRegister);
authRouter.post('/login', loginValidation, userLogin);

export default authRouter;
