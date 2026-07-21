import { useEffect } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiGrid,
  FiMoreVertical,
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout.jsx';
import { useProduct } from '../../hook/useProduct.js';

const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

const productStatus = (p) =>
  p.stock === 0 ? 'out' : p.status === 'active' ? 'active' : 'draft';

const badge = {
  active: {
    label: 'Active',
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  draft: { label: 'Draft', cls: 'border-line bg-line/40 text-muted' },
  out: {
    label: 'Out of Stock',
    cls: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
};

const thCls =
  'p-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';

const StatusBadge = ({ status }) => {
  const b = badge[status];
  return (
    <span
      className={`inline-block border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${b.cls}`}
    >
      {b.label}
    </span>
  );
};

const AllAdminProducts = () => {
  const { handleGetAdminProducts } = useProduct();
  const { adminProducts, loading, errors } = useSelector(
    (state) => state.product,
  );

  useEffect(() => {
    handleGetAdminProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: 'Total Products', value: adminProducts.length },
    {
      label: 'Active Listings',
      value: adminProducts.filter((p) => productStatus(p) === 'active').length,
    },
    {
      label: 'Draft Mode',
      value: adminProducts.filter((p) => productStatus(p) === 'draft').length,
    },
    {
      label: 'Out of Stock',
      value: adminProducts.filter((p) => productStatus(p) === 'out').length,
      accent: true,
    },
  ];

  return (
    <AdminLayout active="Products">
      <div className="p-8 lg:p-10">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
              Products
            </h1>
            <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
              {adminProducts.length} items total in catalogue
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-accent px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 active:scale-95"
          >
            <FiPlus className="h-4 w-4" />
            Add Product
          </Link>
        </header>

        {/* Stat cards */}
        <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ label, value, accent }) => (
            <div key={label} className="border border-line bg-field p-6">
              <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                {label}
              </p>
              <h3
                className={`font-display text-4xl font-bold ${accent ? 'text-accent' : 'text-paper'}`}
              >
                {value}
              </h3>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                name="searchQuery"
                placeholder="Search products / SKU..."
                className="w-full border border-line bg-field py-3 pl-11 pr-4 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
              />
            </div>
            <div className="hidden gap-4 md:flex">
              {[
                {
                  label: 'Category',
                  opts: ["Men's", "Women's", 'Accessories'],
                },
                { label: 'Status', opts: ['Active', 'Draft', 'Out of Stock'] },
              ].map(({ label, opts }) => (
                <div key={label} className="relative">
                  <select
                    name={label.toLowerCase()}
                    className="min-w-[150px] appearance-none border border-line bg-field px-4 py-3 pr-10 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper outline-none transition-colors focus:border-accent"
                  >
                    <option>{label}</option>
                    {opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                </div>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 border border-line p-2">
            <button
              type="button"
              aria-label="List view"
              className="bg-field p-1.5 text-paper"
            >
              <FiList className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Grid view"
              className="p-1.5 text-muted transition-colors hover:text-paper"
            >
              <FiGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-line bg-field">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th className="w-12 p-4 text-center">
                  <input
                    type="checkbox"
                    name="selectAll"
                    className="stitch-checkbox"
                  />
                </th>
                <th className={thCls}>Product</th>
                <th className={thCls}>Category</th>
                <th className={thCls}>Price</th>
                <th className={thCls}>Stock</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted"
                  >
                    Loading products...
                  </td>
                </tr>
              )}
              {!loading && errors && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-red-400"
                  >
                    {errors}
                  </td>
                </tr>
              )}
              {!loading && !errors && adminProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted"
                  >
                    No products yet.{' '}
                    <Link
                      to="/admin/products/new"
                      className="text-accent underline underline-offset-4"
                    >
                      Add your first product
                    </Link>
                  </td>
                </tr>
              )}
              {!loading &&
                adminProducts.map((p) => {
                  const status = productStatus(p);
                  const stockCls =
                    status === 'out'
                      ? 'text-red-400'
                      : p.stock <= 5
                        ? 'text-accent'
                        : 'text-muted';
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-line last:border-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          name={`selectProduct-${p._id}`}
                          className="stitch-checkbox"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-12 flex-shrink-0 overflow-hidden bg-ink">
                            {p.images?.[0]?.url && (
                              <img
                                src={p.images[0].url}
                                alt={p.images[0].alt || p.title}
                                className="h-full w-full object-cover opacity-80 grayscale"
                              />
                            )}
                          </div>
                          <div>
                            <p className="mb-1 font-display text-sm font-semibold uppercase text-paper">
                              {p.title}
                            </p>
                            <p className="font-display text-[10px] uppercase tracking-wide text-muted">
                              ID: {p._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-display text-xs uppercase tracking-wide text-muted">
                        —
                      </td>
                      <td className="p-4 font-display text-sm font-semibold text-paper">
                        {currencySymbols[p.price?.currency] || ''}
                        {Number(p.price?.amount ?? 0).toFixed(2)}
                      </td>
                      <td
                        className={`p-4 font-display text-xs uppercase tracking-wide ${stockCls}`}
                      >
                        {String(p.stock).padStart(2, '0')} Units
                      </td>
                      <td className="p-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          aria-label="Row actions"
                          className="p-2 text-muted transition-colors hover:text-paper"
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-xs uppercase tracking-wide text-muted">
            Showing {adminProducts.length > 0 ? 1 : 0}–{adminProducts.length} of{' '}
            {adminProducts.length} products
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center border border-line text-muted transition-colors hover:bg-field hover:text-paper"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-10 border border-accent bg-accent font-display text-xs font-bold text-ink"
            >
              1
            </button>
            {['2', '3'].map((n) => (
              <button
                key={n}
                type="button"
                className="h-10 w-10 border border-line font-display text-xs font-bold text-paper transition-colors hover:bg-field"
              >
                {n}
              </button>
            ))}
            <span className="px-3 font-display text-xs text-muted">...</span>
            <button
              type="button"
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center border border-line text-muted transition-colors hover:bg-field hover:text-paper"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
};

export default AllAdminProducts;
