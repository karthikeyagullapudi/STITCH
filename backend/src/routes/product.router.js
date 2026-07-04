import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware';
import { createProduct } from '../controller/product.controller';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const productRouter = Router();

productRouter.post(
  '/create',
  authAdmin,
  upload.array('images', 7),
  createProduct,
);

export default productRouter;
