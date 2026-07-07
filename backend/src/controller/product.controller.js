import productModel from '../model/product.model.js';

export const createProduct = async (req, res) => {
  const { title, description, price } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await uploadImage(file.buffer, file.originalname);
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
    seller: req.user._id,
  });

  if (!product) {
    return res
      .status(400)
      .json({ success: false, message: 'Product not created' });
  }

  return res
    .status(201)
    .json({ success: true, message: 'Product created', product });
};
