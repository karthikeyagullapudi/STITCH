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
  FiPlus,
  FiLayers,
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

const MAX_IMAGES = 7;

const variantKey = (size, colorName) => `${size || ''}__${colorName || ''}`;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();
  const { loading, errors } = useSelector((state) => state.product);

  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: '',
    price: '',
    compareAtPrice: '',
    costPerItem: '',
    currency: 'INR',
    chargeTax: false,
    sku: '',
    stock: '',
    trackQuantity: true,
    gender: 'men',
    category: '',
    collection: '',
    vendor: '',
    status: 'active',
  });
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [colorways, setColorways] = useState([]); // [{ name, hex }]
  const [variants, setVariants] = useState([]); // [{ key, size, colorway, sku, stock, price }]
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  /* ---- Media ---- */
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

  /* ---- Tags ---- */
  const addTag = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  /* ---- Sizes ---- */
  const toggleSize = (s) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  /* ---- Colorways ---- */
  const addColorway = () =>
    setColorways((cs) => [...cs, { name: '', hex: '#4A4A4A' }]);
  const updateColorway = (i, field, val) =>
    setColorways((cs) =>
      cs.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)),
    );
  const removeColorway = (i) =>
    setColorways((cs) => cs.filter((_, idx) => idx !== i));

  /* ---- Variant matrix ---- */
  const generateVariants = () => {
    const orderedSizes = SIZES.filter((s) => selectedSizes.includes(s));
    const validColors = colorways.filter((c) => c.name.trim());
    const sizeList = orderedSizes.length ? orderedSizes : [null];
    const colorList = validColors.length ? validColors : [null];

    // Preserve any stock/price/sku already entered, keyed by size+colour.
    const prev = new Map(variants.map((v) => [v.key, v]));
    const next = [];
    for (const size of sizeList) {
      for (const color of colorList) {
        if (!size && !color) continue; // nothing varies — no matrix to build
        const key = variantKey(size, color?.name);
        next.push(
          prev.get(key) || {
            key,
            size: size || '',
            colorway: color ? { name: color.name, hex: color.hex } : null,
            sku: '',
            stock: '',
            price: '',
          },
        );
      }
    }
    setVariants(next);
  };

  const updateVariant = (key, field, val) =>
    setVariants((vs) =>
      vs.map((v) => (v.key === key ? { ...v, [field]: val } : v)),
    );
  const removeVariant = (key) =>
    setVariants((vs) => vs.filter((v) => v.key !== key));

  /* ---- Submit ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (images.length === 0) {
      setFormError('At least one product image is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.slug) formData.append('slug', form.slug);
    formData.append('price', form.price);
    formData.append('currency', form.currency);
    if (form.compareAtPrice)
      formData.append('compareAtPrice', form.compareAtPrice);
    if (form.costPerItem) formData.append('costPerItem', form.costPerItem);
    formData.append('chargeTax', form.chargeTax);
    if (form.sku) formData.append('sku', form.sku);
    formData.append('stock', form.stock || 0);
    formData.append('trackQuantity', form.trackQuantity);
    formData.append('gender', form.gender);
    if (form.category) formData.append('category', form.category);
    if (form.collection) formData.append('collection', form.collection);
    if (form.vendor) formData.append('vendor', form.vendor);
    formData.append('status', form.status || 'active');
    formData.append('tags', JSON.stringify(tags));
    formData.append(
      'colorways',
      JSON.stringify(colorways.filter((c) => c.name.trim())),
    );

    const variantsPayload = variants.map((v) => ({
      size: v.size || undefined,
      colorway: v.colorway || undefined,
      sku: v.sku?.trim() || undefined,
      stock: Number(v.stock) || 0,
      price: v.price
        ? { amount: Number(v.price), currency: form.currency }
        : undefined,
    }));
    formData.append('variants', JSON.stringify(variantsPayload));

    images.forEach(({ file }) => formData.append('images', file));

    const result = await handleCreateProduct(formData);
    if (result.success) {
      navigate('/admin/products');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalVariantStock = variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0,
  );
  const symbol = currencySymbols[form.currency] || '₹';

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
              onClick={() => setForm({ ...form, status: 'draft' })}
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

          {(formError || errors) && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError || errors}
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
                      {i === 0 && (
                        <span className="absolute left-1.5 top-1.5 bg-accent px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.16em] text-ink">
                          Cover
                        </span>
                      )}
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
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="luna-01-modular-parka"
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">
                      Leave blank to auto-generate from the product name.
                    </p>
                  </div>
                </div>
              </section>

              {/* Pricing + Inventory */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className={cardCls}>
                  <h2 className={cardTitleCls}>Pricing</h2>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Price</label>
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
                      <label className={labelCls}>Currency</label>
                      <Select
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className={labelCls}>Compare At</label>
                      <input
                        type="number"
                        name="compareAtPrice"
                        value={form.compareAtPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Cost / Item</label>
                      <input
                        type="number"
                        name="costPerItem"
                        value={form.costPerItem}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 border-t border-line/60 pt-3 select-none">
                    <input
                      type="checkbox"
                      name="chargeTax"
                      checked={form.chargeTax}
                      onChange={handleChange}
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
                        value={form.sku}
                        onChange={handleChange}
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
                      {variants.length > 0 && (
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">
                          Base stock · variants add {totalVariantStock} units
                          across {variants.length} SKUs.
                        </p>
                      )}
                    </div>
                    <label className="flex items-center justify-between border-t border-line/60 pt-3 cursor-pointer select-none">
                      <span className="text-xs uppercase tracking-wide text-muted">
                        Track quantity
                      </span>
                      <input
                        type="checkbox"
                        name="trackQuantity"
                        checked={form.trackQuantity}
                        onChange={handleChange}
                        className="stitch-checkbox"
                      />
                    </label>
                  </div>
                </section>
              </div>

              {/* Variants */}
              <section className={cardCls}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                    Variants
                  </h2>
                  <button
                    type="button"
                    onClick={generateVariants}
                    className="flex items-center gap-1.5 border border-accent/30 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/10"
                  >
                    <FiLayers className="h-3 w-3" />
                    Generate Matrix
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Size chart */}
                  <div>
                    <label className={labelCls}>Size Chart</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => {
                        const active = selectedSizes.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSize(s)}
                            className={`flex h-12 w-12 items-center justify-center font-display text-xs font-bold transition-colors ${
                              active
                                ? 'border border-accent bg-accent/10 text-accent'
                                : 'border border-line text-muted hover:border-paper'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colorways */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        Colorways
                      </label>
                      <button
                        type="button"
                        onClick={addColorway}
                        className="flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent transition-colors hover:text-paper"
                      >
                        <FiPlus className="h-3 w-3" />
                        Add colorway
                      </button>
                    </div>
                    {colorways.length === 0 ? (
                      <p className="border border-dashed border-line px-4 py-3 text-[11px] uppercase tracking-wide text-faint">
                        No colorways yet — add one to build coloured variants.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {colorways.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 border border-line bg-panel p-2"
                          >
                            <label className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line">
                              <span
                                className="block h-full w-full"
                                style={{ backgroundColor: c.hex }}
                              />
                              <input
                                type="color"
                                value={c.hex}
                                onChange={(e) =>
                                  updateColorway(i, 'hex', e.target.value)
                                }
                                className="absolute inset-0 cursor-pointer opacity-0"
                                aria-label="Colour picker"
                              />
                            </label>
                            <input
                              type="text"
                              value={c.name}
                              onChange={(e) =>
                                updateColorway(i, 'name', e.target.value)
                              }
                              placeholder="Colour name (e.g. Onyx)"
                              className="flex-1 bg-transparent px-1 text-sm text-paper outline-none placeholder:text-faint"
                            />
                            <span className="font-mono text-[11px] uppercase text-muted">
                              {c.hex}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeColorway(i)}
                              aria-label="Remove colorway"
                              className="text-muted transition-colors hover:text-red-400"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generated variant matrix */}
                  {variants.length > 0 && (
                    <div>
                      <label className={labelCls}>
                        Variant Matrix · {variants.length} SKUs
                      </label>
                      <div className="overflow-x-auto border border-line">
                        <table className="w-full min-w-[520px] text-left">
                          <thead>
                            <tr className="border-b border-line bg-panel font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                              <th className="px-3 py-2">Variant</th>
                              <th className="px-3 py-2">SKU</th>
                              <th className="w-24 px-3 py-2">Stock</th>
                              <th className="w-32 px-3 py-2">Price</th>
                              <th className="w-10 px-3 py-2" />
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v) => (
                              <tr
                                key={v.key}
                                className="border-b border-line/60 last:border-0"
                              >
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    {v.colorway && (
                                      <span
                                        className="h-4 w-4 shrink-0 rounded-full border border-line"
                                        style={{
                                          backgroundColor: v.colorway.hex,
                                        }}
                                        title={v.colorway.name}
                                      />
                                    )}
                                    <span className="font-display text-xs font-bold uppercase tracking-wide text-paper">
                                      {[v.size, v.colorway?.name]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) =>
                                      updateVariant(v.key, 'sku', e.target.value)
                                    }
                                    placeholder="Auto"
                                    className="w-full border border-line bg-panel px-2 py-1.5 text-xs text-paper outline-none focus:border-accent placeholder:text-faint"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) =>
                                      updateVariant(
                                        v.key,
                                        'stock',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="0"
                                    className="w-full border border-line bg-panel px-2 py-1.5 text-xs text-paper outline-none focus:border-accent placeholder:text-faint"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center border border-line bg-panel focus-within:border-accent">
                                    <span className="pl-2 text-xs text-muted">
                                      {symbol}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={v.price}
                                      onChange={(e) =>
                                        updateVariant(
                                          v.key,
                                          'price',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Base"
                                      className="w-full bg-transparent px-2 py-1.5 text-xs text-paper outline-none placeholder:text-faint"
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(v.key)}
                                    aria-label="Remove variant"
                                    className="text-muted transition-colors hover:text-red-400"
                                  >
                                    <FiTrash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-faint">
                        Leave price blank to inherit the base product price.
                      </p>
                    </div>
                  )}
                </div>
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
                    <span
                      className={`h-2 w-2 rounded-full ${
                        form.status === 'active'
                          ? 'bg-emerald-500'
                          : form.status === 'draft'
                            ? 'bg-amber-500'
                            : 'bg-line'
                      }`}
                    />
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
                    <label className={labelCls}>Gender</label>
                    <Select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="men">MEN</option>
                      <option value="women">WOMEN</option>
                      <option value="unisex">UNISEX</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g. Outerwear"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Collection</label>
                    <Select
                      name="collection"
                      value={form.collection}
                      onChange={handleChange}
                    >
                      <option value="">Select collection</option>
                      <option value="SS24 LUNACORE">SS24 LUNACORE</option>
                      <option value="FW23 STRUCTURALISM">
                        FW23 STRUCTURALISM
                      </option>
                      <option value="CORE ESSENTIALS">CORE ESSENTIALS</option>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Vendor</label>
                    <input
                      type="text"
                      name="vendor"
                      value={form.vendor}
                      onChange={handleChange}
                      placeholder="STITCH FACTORY-01"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tags</label>
                    <div className="flex min-h-[80px] flex-wrap content-start gap-2 border border-line bg-panel p-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 bg-line px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-paper"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-muted transition-colors hover:text-accent"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Add..."
                        className="w-20 grow bg-transparent p-1 font-display text-[10px] uppercase tracking-wide text-paper outline-none placeholder:text-faint"
                      />
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">
                      Press Enter to add a tag.
                    </p>
                  </div>
                </div>
              </section>

              {/* Storefront preview */}
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Storefront Preview</h2>
                <div className="border border-line bg-ink p-4">
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-panel">
                    {images[0] ? (
                      <img
                        src={images[0].preview}
                        alt="Store preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FiImage className="h-8 w-8 text-line" />
                      </div>
                    )}
                    {form.status === 'active' && (
                      <span className="absolute left-2 top-2 bg-accent px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.2em] text-ink">
                        New
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
                      {form.collection || 'SS24 Lunacore'}
                    </p>
                    <p className="truncate font-display text-sm font-bold uppercase text-paper">
                      {form.title || 'Product name'}
                    </p>
                    <p className="font-display text-sm text-muted">
                      {form.price ? `${symbol}${form.price}` : `${symbol}0.00`}
                    </p>
                  </div>
                  {colorways.filter((c) => c.name.trim()).length > 0 && (
                    <div className="mt-4 flex gap-1.5">
                      {colorways
                        .filter((c) => c.name.trim())
                        .slice(0, 5)
                        .map((c, i) => (
                          <span
                            key={i}
                            className="h-2 w-2 rounded-full border border-line"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateProduct;
