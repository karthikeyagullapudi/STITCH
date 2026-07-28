import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware.js';
import {
  createProduct,
  getAdminProducts,
  getAllProducts,
  getProductById,
  addProductVariants,
} from '../controller/product.controller.js';
import {
  createProductValidator,
  addProductVariantsValidator,
} from '../validator/product.validator.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const productRouter = Router();

// `upload.any()` lets us receive both the product-level `images` field and the
// per-variant `variantImages_<index>` fields in a single multipart request.
productRouter.post(
  '/create',
  authAdmin,
  upload.any(),
  createProductValidator,
  createProduct,
);

productRouter.get('/admin/all-products', authAdmin, getAdminProducts);

productRouter.get('/all-products', getAllProducts);

productRouter.get('/product/:productId', getProductById);

productRouter.post(
  '/:productId/variants',
  authAdmin,
  upload.array('images', 5),
  addProductVariantsValidator,
  addProductVariants,
);

export default productRouter;
