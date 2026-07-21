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
  });
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

              {/* Variants */}
              <section className={cardCls}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                    Variants
                  </h2>
                  <button
                    type="button"
                    className="border border-accent/20 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/10"
                  >
                    Add Option
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className={labelCls}>Size Chart</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s, i) => (
                        <button
                          key={s}
                          type="button"
                          className={`flex h-12 w-12 items-center justify-center font-display text-xs font-bold ${
                            i === 0
                              ? 'border border-accent bg-accent/10 text-accent'
                              : 'border border-line text-muted transition-colors hover:border-paper'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Colorways</label>
                    <div className="flex flex-wrap gap-4">
                      {colorways.map(({ name, hex, active }) => (
                        <div
                          key={name}
                          className="flex flex-col items-center gap-2"
                        >
                          <button
                            type="button"
                            aria-label={name}
                            style={{ backgroundColor: hex }}
                            className={`h-10 w-10 rounded-full ${
                              active
                                ? 'border-2 border-accent p-0.5'
                                : 'border border-line transition-colors hover:border-paper'
                            }`}
                          >
                            {active && (
                              <span className="block h-full w-full rounded-full border border-line" />
                            )}
                          </button>
                          <span
                            className={`font-display text-[10px] font-bold uppercase tracking-wide ${
                              active ? 'text-accent' : 'text-muted'
                            }`}
                          >
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
