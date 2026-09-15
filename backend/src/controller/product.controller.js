import productModel, { SIZES } from '../model/product.model.js';
import { uploadFile, deleteFile } from '../services/storage.services.js';
import { getPagination, escapeRegex } from '../utils/query.js';
import { notifyBackInStock } from './wishlist.controller.js';

/* ------------------------------------------------------------------ */
/* Helpers — multipart/form-data delivers everything as strings, so    */
/* coerce defensively before handing values to Mongoose.               */
/* ------------------------------------------------------------------ */

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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
const buildUniqueSlug = async (base, excludeId) => {
  const root = slugify(base) || `product-${Date.now().toString(36)}`;
  const exists = await productModel.exists({
    slug: root,
    _id: { $ne: excludeId },
  });
  return exists ? `${root}-${Date.now().toString(36)}` : root;
};

const normalizeColorway = (colorway) => {
  if (typeof colorway === 'string') return { name: colorway, hex: '#000000' };
  if (colorway && typeof colorway === 'object') {
    return {
      name: colorway.name || 'Default',
      hex: HEX_COLOR.test(colorway.hex) ? colorway.hex : '#000000',
    };
  }
  return undefined;
};

const parseColorways = (value) =>
  parseList(value).map(
    (item) => normalizeColorway(item) || { name: 'Default', hex: '#000000' },
  );

// Existing variants keep their `_id` (and kept images) when edited.
const parseVariants = (value) =>
  parseList(value).map((v) => ({
    _id: v._id || undefined,
    size: v.size ? String(v.size).toUpperCase() : undefined,
    colorway: normalizeColorway(v.colorway),
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

const sumStock = (variants) =>
  variants.reduce((sum, v) => sum + (v.stock || 0), 0);

// Uploads multer files to ImageKit, remembering each fileId so the request
// can remove them again if the product never gets saved.
const createUploader = () => {
  const fileIds = [];
  const uploadImage = async (file) => {
    const uploaded = await uploadFile({
      buffer: file.buffer,
      fileName: file.originalname,
    });
    fileIds.push(uploaded.fileId);
    return {
      url: uploaded.fileUrl,
      fileId: uploaded.fileId,
      alt: file.originalname,
    };
  };
  return { uploadImage, fileIds };
};

// Per-variant images arrive as `variantImages_<index>`, matching the
// variant's position in the `variants` array.
const attachVariantImages = (variants, files, uploadImage) =>
  Promise.all(
    variants.map(async (variant, index) => {
      const variantFiles = files.filter(
        (file) => file.fieldname === `variantImages_${index}`,
      );
      if (variantFiles.length === 0) return;
      const uploaded = await Promise.all(variantFiles.map(uploadImage));
      variant.images = [...variant.images, ...uploaded];
    }),
  );

const collectFileIds = (product) => [
  ...product.images.map((image) => image.fileId),
  ...product.variants.flatMap((variant) =>
    variant.images.map((image) => image.fileId),
  ),
];

// A failed ImageKit delete is logged but never fails the request.
const deleteImages = (fileIds) =>
  Promise.all(
    fileIds.filter(Boolean).map((fileId) =>
      deleteFile(fileId).catch((error) =>
        console.error(`ImageKit delete failed for ${fileId}:`, error.message),
      ),
    ),
  );

const handleProductError = (res, label, error, message) => {
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
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message });
};

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const createProduct = async (req, res) => {
  const { uploadImage, fileIds: uploadedFileIds } = createUploader();
  try {
    const {
      title,
      description,
      materials,
      slug,
      price,
      currency,
      compareAtPrice,
      costPerItem,
      chargeTax,
      sku,
      stock,
      trackQuantity,
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
    const productFiles = allFiles.filter((file) => file.fieldname === 'images');

    if (productFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    const images = await Promise.all(productFiles.map(uploadImage));
    const parsedVariants = parseVariants(variants);
    await attachVariantImages(parsedVariants, allFiles, uploadImage);

    const product = await productModel.create({
      title,
      slug: await buildUniqueSlug(slug || title),
      description,
      materials,
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
      // Stock follows the variants when there are any.
      stock:
        parsedVariants.length > 0
          ? sumStock(parsedVariants)
          : (toNumberOrNull(stock) ?? 0),
      trackQuantity: toBool(trackQuantity, true),
      colorways: parseColorways(colorways),
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
    await deleteImages(uploadedFileIds);
    return handleProductError(res, 'createProduct', error, 'Failed to create product');
  }
};

// Partial update: only the fields that are sent change. Products are managed
// store-wide; `admin` only records who created them.
export const updateProduct = async (req, res) => {
  const { uploadImage, fileIds: uploadedFileIds } = createUploader();
  try {
    const product = await productModel.findById(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'product not found' });
    }

    const body = req.body;
    const files = Array.isArray(req.files) ? req.files : [];
    const previousFileIds = collectFileIds(product);

    ['title', 'description', 'materials', 'category', 'vendor', 'status', 'gender']
      .filter((field) => body[field] !== undefined)
      .forEach((field) => {
        product[field] = body[field];
      });
    if (body.collection !== undefined) product.collectionName = body.collection;
    if (body.sku !== undefined) product.sku = body.sku ? String(body.sku).trim() : undefined;
    if (body.price !== undefined) {
      product.price = {
        amount: toNumberOrNull(body.price) ?? 0,
        currency: body.currency || product.price.currency,
      };
    }
    if (body.compareAtPrice !== undefined) {
      product.compareAtPrice = toNumberOrNull(body.compareAtPrice);
    }
    if (body.costPerItem !== undefined) {
      product.costPerItem = toNumberOrNull(body.costPerItem);
    }
    if (body.chargeTax !== undefined) product.chargeTax = toBool(body.chargeTax);
    if (body.trackQuantity !== undefined) {
      product.trackQuantity = toBool(body.trackQuantity, true);
    }
    if (body.tags !== undefined) product.tags = parseList(body.tags);
    if (body.colorways !== undefined) {
      product.colorways = parseColorways(body.colorways);
    }
    if (body.slug !== undefined && body.slug !== product.slug) {
      product.slug = await buildUniqueSlug(body.slug || product.title, product._id);
    }

    // Images = the ones the admin kept + any new uploads.
    const newImageFiles = files.filter((file) => file.fieldname === 'images');
    if (body.existingImages !== undefined || newImageFiles.length > 0) {
      const kept =
        body.existingImages !== undefined
          ? parseList(body.existingImages)
          : product.images;
      product.images = [
        ...kept,
        ...(await Promise.all(newImageFiles.map(uploadImage))),
      ];
    }

    if (body.variants !== undefined) {
      const variants = parseVariants(body.variants);
      await attachVariantImages(variants, files, uploadImage);
      product.variants = variants;
    }

    if (product.variants.length > 0) {
      product.stock = sumStock(product.variants);
    } else if (body.stock !== undefined) {
      product.stock = toNumberOrNull(body.stock) ?? 0;
    }

    await product.save();

    // Remove images that are no longer used anywhere on the product.
    const keptFileIds = new Set(collectFileIds(product));
    await deleteImages(
      previousFileIds.filter((fileId) => !keptFileIds.has(fileId)),
    );
    // Restocks can fulfil back-in-stock alerts; never block the response.
    notifyBackInStock(product._id).catch((error) =>
      console.error('Back-in-stock alert error:', error),
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    await deleteImages(uploadedFileIds);
    return handleProductError(res, 'updateProduct', error, 'Failed to update product');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'product not found' });
    }

    await deleteImages(collectFileIds(product));
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return handleProductError(res, 'deleteProduct', error, 'Failed to delete product');
  }
};

export const getAdminProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.productId).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'product not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'product fetched successfully',
      product,
    });
  } catch (error) {
    return handleProductError(res, 'getAdminProductById', error, 'Failed to fetch product');
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const { page, limit, skip } = getPagination(req.query, 10);
    const scope = {};
    const outOfStock = { trackQuantity: true, stock: { $lte: 0 } };

    const filter = { ...scope };
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: pattern }, { sku: pattern }, { 'variants.sku': pattern }];
    }
    if (category) filter.category = category;
    // "out" is a stock state rather than a stored status.
    if (status === 'out') Object.assign(filter, outOfStock);
    else if (status) filter.status = status;

    const [products, total, categories, statusCounts, outCount] =
      await Promise.all([
        productModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        productModel.countDocuments(filter),
        productModel.distinct('category', scope),
        productModel.aggregate([
          { $match: scope },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        productModel.countDocuments({ ...scope, ...outOfStock }),
      ]);

    const counts = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count]),
    );

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      count: products.length,
      products,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      categories: categories.filter(Boolean).sort(),
      stats: {
        total: statusCounts.reduce((sum, { count }) => sum + count, 0),
        active: counts.active || 0,
        draft: counts.draft || 0,
        archived: counts.archived || 0,
        outOfStock: outCount,
      },
    });
  } catch (error) {
    return handleProductError(res, 'getAdminProducts', error, 'Failed to fetch products');
  }
};

/* ------------------------------------------------------------------ */
/* Storefront                                                          */
/* ------------------------------------------------------------------ */

const PRODUCT_SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { 'price.amount': 1 },
  'price-desc': { 'price.amount': -1 },
};

// Comma-separated query values, e.g. ?size=S,M
const toList = (value) =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const exactMatch = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

export const getAllProducts = async (req, res) => {
  try {
    const { q, gender, category, size, tag, collection, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query, 12);

    // Storefront should only ever see published products.
    const scope = { status: 'active' };
    if (gender) {
      // Gender collections include unisex pieces.
      scope.gender = gender === 'unisex' ? 'unisex' : { $in: [gender, 'unisex'] };
    }
    if (collection) scope.collectionName = exactMatch(collection);
    if (q) {
      const pattern = new RegExp(escapeRegex(q), 'i');
      scope.$or = [
        { title: pattern },
        { description: pattern },
        { category: pattern },
        { tags: pattern },
      ];
    }

    // Filters narrow the results, while facets come from the whole scope so
    // every option stays selectable.
    const filter = { ...scope };
    if (category) filter.category = { $in: toList(category).map(exactMatch) };
    if (size) {
      filter['variants.size'] = {
        $in: toList(size).map((s) => s.toUpperCase()),
      };
    }
    if (tag) filter.tags = { $in: toList(tag).map((t) => t.toLowerCase()) };

    const [products, total, categories, sizes, tags] = await Promise.all([
      productModel
        .find(filter)
        .sort(PRODUCT_SORTS[sort] || PRODUCT_SORTS.newest)
        .skip(skip)
        .limit(limit)
        .lean(),
      productModel.countDocuments(filter),
      productModel.distinct('category', scope),
      productModel.distinct('variants.size', scope),
      productModel.distinct('tags', scope),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      count: products.length,
      products,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      facets: {
        categories: categories.filter(Boolean).sort(),
        sizes: SIZES.filter((s) => sizes.includes(s)),
        tags: tags.sort(),
      },
    });
  } catch (error) {
    return handleProductError(res, 'getAllProducts', error, 'Failed to fetch products');
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // Links use the slug; older links that used the id keep working.
    const match = /^[a-f\d]{24}$/i.test(slug)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };
    // Storefront should only ever see published products.
    const product = await productModel
      .findOne({ ...match, status: 'active' })
      .lean();
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
    return handleProductError(res, 'getProductBySlug', error, 'Failed to fetch product');
  }
};
