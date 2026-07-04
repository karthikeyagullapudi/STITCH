import productModel from '../model/product.model';
import { uploadFile } from '../services/storage.services';

export const createProduct = async (req, res) => {
  const { title, discription, price } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    }),
  );

  const product = await productModel.create({
    title,
    discription,
    price: {
      amount: price,
      currency: 'INR',
    },
    images,
    seller: req.user._id,
  });

  if (!product) {
    return res.status(400).json({
      success: false,
      message: 'Product not created',
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
};
