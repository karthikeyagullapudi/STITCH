import mongoose from 'mongoose';

/* Shared enums — single source of truth (reused by the validator). */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const PRODUCT_STATUS = ['active', 'draft', 'archived'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR'];

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    // ImageKit file id — kept so the asset can be deleted later.
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
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Colorway hex must be a valid color'],
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    /* ---- General information ---- */
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // URL slug (auto-generated from title in the controller when omitted).
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
    // "Compare at" / original price shown struck-through on the storefront.
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    // Internal cost per item (for margin reporting; never exposed publicly).
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
      sparse: true, // allow many products without an SKU
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
    sizes: {
      type: [{ type: String, enum: SIZES, uppercase: true }],
      default: [],
    },
    colorways: {
      type: [colorwaySchema],
      default: [],
    },

    /* ---- Organization ---- */
    category: {
      type: String,
      trim: true,
    },
    // Named `collectionName` because `collection` is a reserved Mongoose path.
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

    /* ---- Publish status ---- */
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
productSchema.index({ title: 'text', description: 'text', tags: 'text', sku: 'text' });

const productModel = mongoose.model('product', productSchema);
export default productModel;
