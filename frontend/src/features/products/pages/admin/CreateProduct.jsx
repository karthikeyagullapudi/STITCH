import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiChevronRight,
  FiChevronDown,
  FiUploadCloud,
  FiImage,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout.jsx';
import { useProduct } from '../../hook/useProduct.js';

const cardCls = 'border border-line bg-field p-6';
const cardTitleCls =
  'mb-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const labelCls =
  'mb-2 block font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const inputCls =
  'w-full border border-line bg-panel px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent';

/* Dark native select with a chevron overlay */
const Select = ({ children, ...props }) => (
  <div className="relative">
    <select className={`${inputCls} appearance-none pr-10`} {...props}>
      {children}
    </select>
    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
  </div>
);

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const colorways = [
  { name: 'Onyx', hex: '#000000', active: true },
  { name: 'Olive', hex: '#2A2D2B', active: false },
  { name: 'Wolf', hex: '#4A4A4A', active: false },
];

const MAX_IMAGES = 7;
const MAX_VARIANT_IMAGES = 5;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();
  const { loading, errors } = useSelector((state) => state.product);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    status: 'active',
    gender: 'unisex',
    category: "MEN'S OUTERWEAR",
    collection: 'SS24 LUNACORE',
    vendor: 'STITCH FACTORY-01',
    sku: '',
  });
  const [tags, setTags] = useState(['Waterproof', 'Cordura']);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Variant Builder State
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    size: 'M',
    colorName: 'Onyx',
    colorHex: '#000000',
    sku: '',
    stock: '',
    price: '',
    images: [],
  });
  const variantFileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleNewVariantChange = (e) => {
    setNewVariant({ ...newVariant, [e.target.name]: e.target.value });
  };

  const handleVariantImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setNewVariant((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
      ].slice(0, MAX_VARIANT_IMAGES),
    }));
    e.target.value = '';
  };

  const removeVariantImage = (index) => {
    setNewVariant((prev) => {
      URL.revokeObjectURL(prev.images[index]?.preview);
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
  };

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.colorName) return;

    const variantToAdd = {
      size: newVariant.size,
      colorway: {
        name: newVariant.colorName,
        hex: newVariant.colorHex || '#000000',
      },
      sku: newVariant.sku
        ? newVariant.sku.trim().toUpperCase()
        : `STCH-${newVariant.size}-${newVariant.colorName.toUpperCase()}`,
      stock:
        newVariant.stock !== ''
          ? Number(newVariant.stock)
          : Number(form.stock || 0),
      price:
        newVariant.price !== ''
          ? { amount: Number(newVariant.price), currency: 'INR' }
          : undefined,
      images: newVariant.images,
    };

    setVariants([...variants, variantToAdd]);
    // Reset variant input draft
    setNewVariant({
      size: 'M',
      colorName: 'Onyx',
      colorHex: '#000000',
      sku: '',
      stock: '',
      price: '',
      images: [],
    });
  };

  const handleRemoveVariant = (index) => {
    const removed = variants[index];
    removed?.images?.forEach((img) => URL.revokeObjectURL(img.preview));
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const next = [
      ...images,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ].slice(0, MAX_IMAGES);
    setImages(next);
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock || 0);
    formData.append('status', form.status || 'active');
    formData.append('gender', form.gender || 'unisex');
    if (form.category) formData.append('category', form.category);
    if (form.collection) formData.append('collection', form.collection);
    if (form.vendor) formData.append('vendor', form.vendor);
    if (form.sku) formData.append('sku', form.sku);
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    // Attach parsed variants and unique sizes/colorways
    if (variants.length > 0) {
      // Serialize variant metadata without the File objects, then attach each
      // variant's images under `variantImages_<index>` for the backend to pair
      // up by position.
      const variantsPayload = variants.map((v) => ({
        size: v.size,
        colorway: v.colorway,
        sku: v.sku,
        stock: v.stock,
        ...(v.price ? { price: v.price } : {}),
      }));
      formData.append('variants', JSON.stringify(variantsPayload));

      variants.forEach((v, index) => {
        (v.images || []).forEach(({ file }) => {
          formData.append(`variantImages_${index}`, file);
        });
      });

      const extractedSizes = Array.from(
        new Set(variants.map((v) => v.size).filter(Boolean)),
      );
      formData.append('sizes', JSON.stringify(extractedSizes));

      const uniqueColorwaysMap = new Map();
      variants.forEach((v) => {
        if (v.colorway && v.colorway.name) {
          uniqueColorwaysMap.set(v.colorway.name, v.colorway);
        }
      });
      formData.append(
        'colorways',
        JSON.stringify(Array.from(uniqueColorwaysMap.values())),
      );
    }

    images.forEach(({ file }) => formData.append('images', file));

    const result = await handleCreateProduct(formData);
    if (result.success) {
      navigate('/admin/products');
    }
  };

  return (
    <AdminLayout active="Products">
      <form onSubmit={handleSubmit}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.12em]">
            <Link
              to="/admin/products"
              className="text-muted transition-colors hover:text-paper"
            >
              Products
            </Link>
            <FiChevronRight className="h-3.5 w-3.5 text-faint" />
            <span className="text-paper">New</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="border border-line px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-field"
            >
              Discard
            </button>
            <button
              type="button"
              className="px-2 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-paper"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent px-6 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto w-full max-w-[1440px] p-6">
          <div className="mb-8">
            <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
              Create Product
            </h1>
            <p className="max-w-2xl text-sm text-muted">
              Configure a new SKU for the SS24 LUNACORE collection. Ensure
              technical specifications and variant details are precise.
            </p>
          </div>

          {errors && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errors}
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-8">
              {/* Media */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Media Assets</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group col-span-4 flex h-60 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-line transition-colors hover:border-accent/50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageSelect}
                    />
                    <FiUploadCloud className="mb-2 h-9 w-9 text-muted transition-colors group-hover:text-accent" />
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                      Drop files or click to upload
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">
                      JPG, PNG, WEBP up to 5MB · max {MAX_IMAGES} images
                    </p>
                  </div>

                  {/* Uploaded thumbnails */}
                  {images.map(({ file, preview }, i) => (
                    <div
                      key={preview}
                      className="group relative aspect-[3/4] overflow-hidden border border-line"
                    >
                      <img
                        src={preview}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-accent/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removeImage(i)}
                          className="flex h-8 w-8 items-center justify-center border border-line bg-field text-red-400"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {images.length === 0 &&
                    [0, 1].map((i) => (
                      <div
                        key={i}
                        className="flex aspect-[3/4] items-center justify-center border border-line bg-panel"
                      >
                        <FiImage className="h-6 w-6 text-line" />
                      </div>
                    ))}
                </div>
              </section>

              {/* General */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>General Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Product Name</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. LUNA-01 MODULAR PARKA"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Technical specifications, fabric composition, and sizing notes..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center border border-r-0 border-line bg-panel px-4 text-xs text-muted">
                        stitch.tech/products/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        placeholder="luna-01-modular-parka"
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing + Inventory */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className={cardCls}>
                  <h2 className={cardTitleCls}>Pricing</h2>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Price (INR)</label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Compare At</label>
                      <input
                        type="number"
                        name="compareAtPrice"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Cost / Item</label>
                      <input
                        type="number"
                        name="costPerItem"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 border-t border-line/60 pt-3 select-none">
                    <input
                      type="checkbox"
                      name="chargeTax"
                      className="stitch-checkbox"
                    />
                    <span className="text-xs uppercase tracking-wide text-muted">
                      Charge tax on this product
                    </span>
                  </label>
                </section>

                <section className={cardCls}>
                  <h2 className={cardTitleCls}>Inventory</h2>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>
                        SKU (Stock Keeping Unit)
                      </label>
                      <input
                        type="text"
                        name="sku"
                        placeholder="STCH-LUNA-01-BLK"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Stock Quantity</label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center justify-between border-t border-line/60 pt-3">
                      <span className="text-xs uppercase tracking-wide text-muted">
                        Track quantity
                      </span>
                      <button
                        type="button"
                        aria-label="Toggle track quantity"
                        className="relative h-5 w-10 rounded-full bg-accent p-1"
                      >
                        <span className="block h-3 w-3 translate-x-5 rounded-full bg-ink" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Variants Builder Section */}
              <section className={cardCls}>
                <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper">
                      Product Variants
                    </h2>
                    <p className="text-[11px] text-muted">
                      Add specific size, colorway, price override, and stock for
                      each variant.
                    </p>
                  </div>
                  <span className="border border-line bg-panel px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-accent">
                    {variants.length}{' '}
                    {variants.length === 1 ? 'Variant' : 'Variants'}
                  </span>
                </div>

                {/* Variant Creation Form */}
                <div className="mb-6 border border-line/80 bg-panel p-4 space-y-4">
                  <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                    Create New Variant Option
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                      <label className={labelCls}>Size</label>
                      <select
                        name="size"
                        value={newVariant.size}
                        onChange={handleNewVariantChange}
                        className={inputCls}
                      >
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Colorway Name</label>
                      <input
                        type="text"
                        name="colorName"
                        value={newVariant.colorName}
                        onChange={handleNewVariantChange}
                        placeholder="e.g. Stealth Onyx"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Color Hex</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          name="colorHex"
                          value={newVariant.colorHex}
                          onChange={handleNewVariantChange}
                          className="h-10 w-12 cursor-pointer border border-line bg-field p-1"
                        />
                        <input
                          type="text"
                          name="colorHex"
                          value={newVariant.colorHex}
                          onChange={handleNewVariantChange}
                          placeholder="#000000"
                          className={`${inputCls} flex-1 uppercase`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>SKU (Optional)</label>
                      <input
                        type="text"
                        name="sku"
                        value={newVariant.sku}
                        onChange={handleNewVariantChange}
                        placeholder="e.g. STCH-M-ONYX"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Stock (Qty)</label>
                      <input
                        type="number"
                        name="stock"
                        min="0"
                        value={newVariant.stock}
                        onChange={handleNewVariantChange}
                        placeholder={form.stock || '0'}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Price Override (INR)</label>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={newVariant.price}
                        onChange={handleNewVariantChange}
                        placeholder={form.price ? `₹${form.price}` : 'Default'}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Variant Images */}
                  <div>
                    <label className={labelCls}>
                      Variant Images (Optional · max {MAX_VARIANT_IMAGES})
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => variantFileInputRef.current?.click()}
                        disabled={newVariant.images.length >= MAX_VARIANT_IMAGES}
                        className="group flex h-16 w-16 shrink-0 flex-col items-center justify-center border-2 border-dashed border-line transition-colors hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiUploadCloud className="h-5 w-5 text-muted transition-colors group-hover:text-accent" />
                      </button>
                      <input
                        ref={variantFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleVariantImageSelect}
                      />

                      {newVariant.images.map(({ file, preview }, i) => (
                        <div
                          key={preview}
                          className="group relative h-16 w-16 shrink-0 overflow-hidden border border-line"
                        >
                          <img
                            src={preview}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => removeVariantImage(i)}
                            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center border border-line bg-field text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-2 border border-accent bg-accent/10 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-accent transition-all hover:bg-accent hover:text-ink active:scale-95"
                    >
                      + Add Variant to List
                    </button>
                  </div>
                </div>

                {/* Configured Variants Table */}
                {variants.length > 0 ? (
                  <div className="overflow-x-auto border border-line">
                    <table className="w-full text-left font-display text-[11px]">
                      <thead className="border-b border-line bg-panel uppercase text-muted tracking-wider">
                        <tr>
                          <th className="p-3">Colorway</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Images</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60 bg-field">
                        {variants.map((v, index) => (
                          <tr
                            key={index}
                            className="transition-colors hover:bg-panel/50"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-4 w-4 rounded-full border border-line"
                                  style={{
                                    backgroundColor: v.colorway?.hex || '#000',
                                  }}
                                />
                                <span className="font-bold text-paper">
                                  {v.colorway?.name}
                                </span>
                                <span className="text-[9px] text-faint uppercase">
                                  ({v.colorway?.hex})
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="border border-line bg-panel px-2 py-0.5 font-bold text-accent">
                                {v.size}
                              </span>
                            </td>
                            <td className="p-3 text-muted tracking-wide">
                              {v.sku || 'AUTO-GEN'}
                            </td>
                            <td className="p-3 font-semibold text-paper">
                              {v.stock} units
                            </td>
                            <td className="p-3 text-accent font-semibold">
                              {v.price?.amount
                                ? `₹${v.price.amount}`
                                : form.price
                                  ? `₹${form.price} (Base)`
                                  : 'Default'}
                            </td>
                            <td className="p-3">
                              {v.images?.length > 0 ? (
                                <div className="flex items-center gap-1">
                                  {v.images.slice(0, 3).map((img) => (
                                    <span
                                      key={img.preview}
                                      className="h-8 w-8 overflow-hidden border border-line"
                                    >
                                      <img
                                        src={img.preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    </span>
                                  ))}
                                  {v.images.length > 3 && (
                                    <span className="text-[9px] text-muted">
                                      +{v.images.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-faint uppercase">
                                  None
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="inline-flex items-center gap-1 border border-line bg-panel px-2.5 py-1 text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-line bg-panel/30 py-8 text-center">
                    <p className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                      No Variants Added Yet
                    </p>
                    <p className="mt-1 text-[11px] text-faint">
                      Use the builder above to specify sizes, colors, and stock
                      overrides for this product.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:sticky lg:top-[88px] lg:col-span-4">
              {/* Publish status */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Publish Status</h2>
                <div className="relative mb-4">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none pr-16`}
                  >
                    <option value="active">ACTIVE</option>
                    <option value="draft">DRAFT</option>
                    <option value="archived">ARCHIVED</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <FiChevronDown className="h-4 w-4 text-muted" />
                  </div>
                </div>
                <p className="text-[10px] uppercase leading-relaxed tracking-wide text-faint">
                  Visibility: this product will be hidden from all sales
                  channels if set to draft.
                </p>
              </section>

              {/* Organization */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Organization</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <Select name="category" defaultValue="MEN'S OUTERWEAR">
                      <option>MEN'S OUTERWEAR</option>
                      <option>WOMEN'S ACCESSORIES</option>
                      <option>UNISEX CARGO</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Collection</label>
                    <Select name="collection" defaultValue="SS24 LUNACORE">
                      <option>SS24 LUNACORE</option>
                      <option>FW23 STRUCTURALISM</option>
                      <option>CORE ESSENTIALS</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Vendor</label>
                    <input
                      type="text"
                      name="vendor"
                      placeholder="STITCH FACTORY-01"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tags</label>
                    <div className="flex min-h-[80px] flex-wrap content-start gap-2 border border-line bg-panel p-2">
                      {['Waterproof', 'Cordura'].map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 bg-line px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-paper"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-muted transition-colors hover:text-accent"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        name="tagInput"
                        placeholder="Add..."
                        className="w-20 bg-transparent p-1 font-display text-[10px] uppercase tracking-wide text-paper outline-none placeholder:text-faint"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Storefront preview */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Storefront Preview</h2>
                <div className="border border-line bg-ink p-4">
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-panel">
                    <img
                      src="/images/auth-model.jpg"
                      alt="Store preview"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 bg-accent px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.2em] text-ink">
                      New
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
                      SS24 Lunacore
                    </p>
                    <p className="truncate font-display text-sm font-bold uppercase text-paper">
                      LUNA-01 Modular Parka
                    </p>
                    <p className="font-display text-sm text-muted">$485.00</p>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-paper" />
                    <span className="h-2 w-2 rounded-full border border-line bg-line" />
                    <span className="h-2 w-2 rounded-full border border-line bg-line" />
                  </div>
                </div>
                <p className="mt-4 text-center">
                  <a
                    href="#"
                    className="text-[10px] uppercase tracking-wide text-muted underline underline-offset-4 transition-colors hover:text-accent"
                  >
                    View Live Store Page
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateProduct;
