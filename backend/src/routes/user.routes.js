import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../controller/user.controller.js';
import {
  updateProfileValidator,
  changePasswordValidator,
  addressValidator,
  addressIdParamValidator,
  verifyPhoneOtpValidator,
} from '../validator/user.validator.js';

const userRouter = Router();

userRouter.patch('/me', protect, updateProfileValidator, updateProfile);
userRouter.patch(
  '/me/password',
  authLimiter,
  protect,
  changePasswordValidator,
  changePassword,
);
userRouter.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

userRouter.post('/me/addresses', protect, addressValidator, addAddress);
userRouter.patch(
  '/me/addresses/:addressId',
  protect,
  addressIdParamValidator,
  addressValidator,
  updateAddress,
);
userRouter.delete(
  '/me/addresses/:addressId',
  protect,
  addressIdParamValidator,
  deleteAddress,
);

userRouter.post('/me/verify-phone', authLimiter, protect, sendPhoneOtp);
userRouter.post(
  '/me/verify-phone/confirm',
  authLimiter,
  protect,
  verifyPhoneOtpValidator,
  verifyPhoneOtp,
);

export default userRouter;
