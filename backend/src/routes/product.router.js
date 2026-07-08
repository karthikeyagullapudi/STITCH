import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware.js';
import {
  createProduct,
  getAdminProducts,
} from '../controller/product.controller.js';
import { createProductValidator } from '../validator/product.validato.js';
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
  createProductValidator,
  createProduct,
);

productRouter.get('/admin/my-products', authAdmin, getAdminProducts);

export default productRouter;
