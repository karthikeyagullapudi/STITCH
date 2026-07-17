import productModel from '../model/product.model.js';
import { uploadFile } from '../services/storage.services.js';

/* ------------------------------------------------------------------ */
/* Helpers — multipart/form-data delivers everything as strings, so    */
/* coerce defensively before handing values to Mongoose.               */
/* ------------------------------------------------------------------ */

const slugify = (str = '') =>
  String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Accepts a real array, a JSON string ("[...]"), or a comma-separated list.
const parseList = (value) => {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
};

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

// Keep slugs unique without failing the request on a collision.
const buildUniqueSlug = async (base) => {
  const root = slugify(base) || `product-${Date.now().toString(36)}`;
  const exists = await productModel.exists({ slug: root });
  return exists ? `${root}-${Date.now().toString(36)}` : root;
};

/* ------------------------------------------------------------------ */
/* Controllers                                                         */
/* ------------------------------------------------------------------ */

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      slug,
      price,
      currency,
      compareAtPrice,
      costPerItem,
      chargeTax,
      sku,
      stock,
      trackQuantity,
      sizes,
      colorways,
      category,
      collection, // client may send either key
      collectionName,
      vendor,
      tags,
      status,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    // Upload every image to ImageKit in parallel.
    const images = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
        });
        return {
          url: uploaded.fileUrl,
          fileId: uploaded.fileId,
          alt: file.originalname || title,
        };
      }),
    );

    const product = await productModel.create({
      title,
      slug: await buildUniqueSlug(slug || title),
      description,
      admin: req.user._id,
      images,
      price: {
        amount: toNumberOrNull(price) ?? 0,
        currency: currency || 'INR',
      },
      compareAtPrice: toNumberOrNull(compareAtPrice),
      costPerItem: toNumberOrNull(costPerItem),
      chargeTax: toBool(chargeTax, false),
      sku: sku ? String(sku).trim() : undefined,
      stock: toNumberOrNull(stock) ?? 0,
      trackQuantity: toBool(trackQuantity, true),
      sizes: parseList(sizes),
      colorways: parseList(colorways),
      category,
      collectionName: collectionName || collection,
      vendor,
      tags: parseList(tags),
      status: status || 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    // Duplicate unique key (slug or sku)
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A product with this ${field} already exists`,
      });
    }
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }
    console.error('createProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ admin: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('getAdminProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Storefront should only ever see published products.
    const products = await productModel
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};
