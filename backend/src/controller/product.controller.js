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
      collection,
      collectionName,
      vendor,
      tags,
      status,
      gender,
      variants,
    } = req.body;

    const allFiles = Array.isArray(req.files) ? req.files : [];

    // Product-level images arrive under the `images` field; per-variant images
    // arrive under `variantImages_<index>` fields (index maps to the variant's
    // position in the `variants` array).
    const productFiles = allFiles.filter((file) => file.fieldname === 'images');

    if (productFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    // Upload a single multer file to ImageKit and shape it for the schema.
    const uploadImage = async (file) => {
      const uploaded = await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
      return {
        url: uploaded.fileUrl,
        fileId: uploaded.fileId,
        alt: file.originalname || title,
      };
    };

    // Upload every product image to ImageKit in parallel.
    const images = await Promise.all(productFiles.map(uploadImage));

    // Group variant image files by their variant index for later attachment.
    const variantFilesByIndex = new Map();
    allFiles.forEach((file) => {
      const match = /^variantImages_(\d+)$/.exec(file.fieldname);
      if (!match) return;
      const index = Number(match[1]);
      if (!variantFilesByIndex.has(index)) variantFilesByIndex.set(index, []);
      variantFilesByIndex.get(index).push(file);
    });

    const parseColorways = (val) => {
      const rawList = parseList(val);
      return rawList.map((item) => {
        if (typeof item === 'string') {
          return { name: item, hex: '#000000' };
        }
        if (item && typeof item === 'object') {
          return {
            name: item.name || 'Default',
            hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(item.hex)
              ? item.hex
              : '#000000',
          };
        }
        return { name: 'Default', hex: '#000000' };
      });
    };

    const parseVariants = (val) => {
      if (!val) return [];
      let list = [];
      if (Array.isArray(val)) {
        list = val;
      } else {
        try {
          const parsed = JSON.parse(val);
          list = Array.isArray(parsed) ? parsed : [];
        } catch {
          list = [];
        }
      }
      return list.map((v) => ({
        size: v.size ? String(v.size).toUpperCase() : undefined,
        colorway:
          typeof v.colorway === 'string'
            ? { name: v.colorway, hex: '#000000' }
            : v.colorway && typeof v.colorway === 'object'
            ? {
                name: v.colorway.name || 'Default',
                hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.colorway.hex)
                  ? v.colorway.hex
                  : '#000000',
              }
            : undefined,
        sku: v.sku ? String(v.sku).trim() : undefined,
        stock: toNumberOrNull(v.stock) ?? 0,
        price:
          v.price?.amount !== undefined && v.price?.amount !== null
            ? {
                amount: toNumberOrNull(v.price.amount) ?? 0,
                currency: v.price.currency || 'INR',
              }
            : undefined,
        images: Array.isArray(v.images) ? v.images : [],
      }));
    };

    const parsedVariants = parseVariants(variants);
    const parsedColorways = parseColorways(colorways);

    // Upload each variant's own images and merge them onto the variant. The
    // fieldname index lines up with the variant's position in the array.
    await Promise.all(
      parsedVariants.map(async (variant, index) => {
        const files = variantFilesByIndex.get(index) || [];
        if (files.length === 0) return;
        const uploaded = await Promise.all(files.map(uploadImage));
        variant.images = [...(variant.images || []), ...uploaded];
      }),
    );

    // Calculate aggregate stock if variants are provided
    const totalVariantStock = parsedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const finalStock = parsedVariants.length > 0 ? totalVariantStock : (toNumberOrNull(stock) ?? 0);

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
      stock: finalStock,
      trackQuantity: toBool(trackQuantity, true),
      sizes: parseList(sizes),
      colorways: parsedColorways,
      variants: parsedVariants,
      gender: gender || 'unisex',
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

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'product not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'product fetched successfully',
      product,
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

export const addProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findOne({
      _id: productId,
      admin: req.user._id,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'product not found',
      });
    }
    // files
    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
      await Promise.all(
        files.map(async (file) => {
          const image = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return image;
        }),
      ).map((image) => {
        images.push(image);
      });
    }

    console.log(req.body);
    console.log(images);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
