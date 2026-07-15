import productModel from '../model/product.model.js';
import { uploadFile } from '../services/storage.services.js';

export const createProduct = async (req, res) => {
  const { title, description, price, stock } = req.body;
  const admin = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      const uploadResult = await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
      return {
        url: uploadResult.fileUrl,
        alt: file.originalname || title,
      };
    }),
  );

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: price,
      currency: 'INR',
    },
    images,
    admin: req.user._id,
    stock,
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

export const getAdminProducts = async (req, res) => {
  const admin = req.user;

  const products = await productModel.find({ admin: admin._id });

  if (!products) {
    return res.status(404).json({
      success: false,
      message: 'No products found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Products fetched successfully',
    products,
  });
};
