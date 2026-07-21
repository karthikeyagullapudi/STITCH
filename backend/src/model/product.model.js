import mongoose from 'mongoose';

/* Shared enums — single source of truth (reused by the validator). */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const PRODUCT_STATUS = ['active', 'draft', 'archived'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];
export const GENDERS = ['men', 'women', 'unisex'];

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    fileId: { type: String },
  },
  { _id: false },
);

const colorwaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: {
      type: String,
      required: true,
      match: [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
        'Colorway hex must be a valid color',
      ],
    },
  },
  { _id: false },
);

const priceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      default: 'INR',
    },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: SIZES,
      uppercase: true,
    },
    colorway: {
      type: colorwaySchema,
      default: undefined,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: priceSchema,
      default: undefined,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    /* ---- General information ---- */
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },

    /* ---- Media assets ---- */
    images: {
      type: [imageSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one product image is required',
      },
    },

    /* ---- Pricing ---- */
    price: {
      type: priceSchema,
      required: true,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    costPerItem: {
      type: Number,
      min: 0,
      default: null,
    },
    chargeTax: {
      type: Boolean,
      default: false,
    },

    /* ---- Inventory ---- */
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    trackQuantity: {
      type: Boolean,
      default: true,
    },

    /* ---- Variants ---- */
    variants: {
      type: [variantSchema],
      default: [],
    },
    colorways: {
      type: [colorwaySchema],
      default: [],
    },

    /* ---- Organization ---- */
    gender: {
      type: String,
      required: true,
      enum: GENDERS,
    },
    category: {
      type: String,
      trim: true,
    },
    collectionName: {
      type: String,
      trim: true,
    },
    vendor: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        (Array.isArray(tags) ? tags : [])
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean),
    },

    /* ---- publish status ---- */
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: 'active',
      index: true,
    },
  },
  { timestamps: true },
);

// Full-text search to back the admin catalogue search box.
productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  sku: 'text',
});

const productModel = mongoose.model('product', productSchema);
export default productModel;
