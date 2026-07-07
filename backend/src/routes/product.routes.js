import { Router } from 'express';
import { createProduct } from '../controller/product.controller.js';
import { authAdmin } from '../middleware/auth.middleware.js';
import multer from 'multer';

const upload = multer.memoryStorage({
  storage: multer.diskStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const productRouter = Router();

productRouter.post(
  '/create-product',
  authAdmin,
  upload.array('images', 7),
  createProduct,
);

export default productRouter;
