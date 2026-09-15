import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiList,
  FiGrid,
  FiMoreVertical,
} from 'react-icons/fi';
import AdminLayout from '../../../admin/components/AdminLayout.jsx';
import Pagination from '../../../../shared/components/Pagination.jsx';
import { useProduct } from '../../hook/useProduct.js';
import { formatPrice } from '../../../../shared/utils/format.js';

// Tracked products that have sold out show as "out" whatever their status.
const productStatus = (p) =>
  p.status === 'active' && p.trackQuantity !== false && p.stock <= 0
    ? 'out'
    : p.status;

const badge = {
  active: {
    label: 'Active',
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  draft: { label: 'Draft', cls: 'border-line bg-line/40 text-muted' },
  archived: {
    label: 'Archived',
    cls: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  out: {
    label: 'Out of Stock',
    cls: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
};

const statusOptions = [
  ['active', 'Active'],
  ['draft', 'Draft'],
  ['archived', 'Archived'],
  ['out', 'Out of Stock'],
];

const thCls =
  'p-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const selectCls =
  'min-w-[150px] appearance-none border border-line bg-field px-4 py-3 pr-10 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper outline-none transition-colors focus:border-accent';
const menuItemCls =
  'block w-full px-4 py-2 text-left font-display text-[11px] uppercase tracking-wide text-muted transition-colors hover:bg-field hover:text-paper';

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
  const { handleGetAdminProducts, handleUpdateProduct, handleDeleteProduct } =
    useProduct();
  const { adminProducts, adminProductsMeta, loading, errors } = useSelector(
    (state) => state.product,
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [actionError, setActionError] = useState(null);

  const reload = () =>
    handleGetAdminProducts({ search, category, status, page, limit: 10 });

  // Debounced so typing in the search box doesn't fire a request per key.
  useEffect(() => {
    const timer = setTimeout(reload, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, page]);

  // Any filter change goes back to page one and clears the selection.
  const changeFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
    setSelected([]);
  };

  const toggleSelected = (id) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    );

  const allSelected =
    adminProducts.length > 0 && selected.length === adminProducts.length;

  // Runs one request per product, then refreshes the list.
  const runForProducts = async (ids, action) => {
    setOpenMenu(null);
    const results = await Promise.all(ids.map(action));
    const failed = results.find((result) => !result.success);
    setActionError(failed ? failed.error : null);
    setSelected([]);
    reload();
  };

  const setProductStatus = (ids, nextStatus) =>
    runForProducts(ids, (id) => handleUpdateProduct(id, { status: nextStatus }));

  const deleteProducts = (ids) => {
    if (
      window.confirm(
        `Delete ${ids.length} product${ids.length > 1 ? 's' : ''}? Their images are removed too.`,
      )
    ) {
      runForProducts(ids, handleDeleteProduct);
    }
  };

  const { stats } = adminProductsMeta;
  const statCards = [
    { label: 'Total Products', value: stats.total },
    { label: 'Active Listings', value: stats.active },
    { label: 'Draft Mode', value: stats.draft },
    { label: 'Out of Stock', value: stats.outOfStock, accent: true },
  ];

  const rowActions = (p) => (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${p.title}`}
        onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}
        className="p-2 text-muted transition-colors hover:text-paper"
      >
        <FiMoreVertical className="h-5 w-5" />
      </button>
      {openMenu === p._id && (
        <div className="absolute right-0 z-20 mt-1 w-44 border border-line bg-panel py-1">
          <Link to={`/admin/products/${p._id}/edit`} className={menuItemCls}>
            Edit
          </Link>
          {p.status === 'active' && (
            <a
              href={`/product/${p.slug}`}
              target="_blank"
              rel="noreferrer"
              className={menuItemCls}
            >
              View in Store
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              setProductStatus(
                [p._id],
                p.status === 'archived' ? 'active' : 'archived',
              )
            }
            className={menuItemCls}
          >
            {p.status === 'archived' ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={() => deleteProducts([p._id])}
            className={`${menuItemCls} hover:text-red-400`}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const firstShown = (adminProductsMeta.page - 1) * 10 + 1;

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
              {stats.total} items total in catalogue
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
          {statCards.map(({ label, value, accent }) => (
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
                value={search}
                onChange={changeFilter(setSearch)}
                placeholder="Search products / SKU..."
                className="w-full border border-line bg-field py-3 pl-11 pr-4 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  name="category"
                  value={category}
                  onChange={changeFilter(setCategory)}
                  className={selectCls}
                >
                  <option value="">All Categories</option>
                  {adminProductsMeta.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
              <div className="relative">
                <select
                  name="status"
                  value={status}
                  onChange={changeFilter(setStatus)}
                  className={selectCls}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 border border-line p-2">
            {[
              ['list', 'List view', FiList],
              ['grid', 'Grid view', FiGrid],
            ].map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                aria-label={label}
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
                className={`p-1.5 transition-colors ${
                  view === mode ? 'bg-field text-paper' : 'text-muted hover:text-paper'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-4 border border-accent/40 bg-accent/5 px-4 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em]">
            <span className="text-paper">{selected.length} selected</span>
            <button
              type="button"
              onClick={() => setProductStatus(selected, 'archived')}
              className="text-muted hover:text-paper"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => setProductStatus(selected, 'active')}
              className="text-muted hover:text-paper"
            >
              Set Active
            </button>
            <button
              type="button"
              onClick={() => deleteProducts(selected)}
              className="text-muted hover:text-red-400"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="ml-auto text-muted hover:text-paper"
            >
              Clear
            </button>
          </div>
        )}

        {(errors || actionError) && (
          <p className="mb-4 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {actionError || errors}
          </p>
        )}

        {adminProducts.length === 0 && (
          <p className="border border-line bg-field p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted">
            {loading ? (
              'Loading products...'
            ) : (
              <>
                No products found.{' '}
                <Link
                  to="/admin/products/new"
                  className="text-accent underline underline-offset-4"
                >
                  Add a product
                </Link>
              </>
            )}
          </p>
        )}

        {adminProducts.length > 0 && view === 'list' && (
          <div className="overflow-x-auto border border-line bg-field">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-panel">
                  <th className="w-12 p-4 text-center">
                    <input
                      type="checkbox"
                      name="selectAll"
                      aria-label="Select all products on this page"
                      className="stitch-checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(allSelected ? [] : adminProducts.map((p) => p._id))
                      }
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
                {adminProducts.map((p) => {
                  const rowStatus = productStatus(p);
                  const stockCls =
                    rowStatus === 'out'
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
                          aria-label={`Select ${p.title}`}
                          className="stitch-checkbox"
                          checked={selected.includes(p._id)}
                          onChange={() => toggleSelected(p._id)}
                        />
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="flex items-center gap-4"
                        >
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
                              {p.sku ? `SKU: ${p.sku}` : `ID: ${p._id.slice(-8)}`}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 font-display text-xs uppercase tracking-wide text-muted">
                        {p.category || '—'}
                      </td>
                      <td className="p-4 font-display text-sm font-semibold text-paper">
                        {formatPrice(p.price?.amount, p.price?.currency)}
                      </td>
                      <td
                        className={`p-4 font-display text-xs uppercase tracking-wide ${stockCls}`}
                      >
                        {String(p.stock).padStart(2, '0')} Units
                      </td>
                      <td className="p-4">
                        <StatusBadge status={rowStatus} />
                      </td>
                      <td className="p-4 text-right">{rowActions(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {adminProducts.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">
            {adminProducts.map((p) => (
              <div key={p._id} className="border border-line bg-field">
                <div className="relative aspect-[3/4] overflow-hidden bg-ink">
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.images[0].alt || p.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <input
                    type="checkbox"
                    aria-label={`Select ${p.title}`}
                    className="stitch-checkbox absolute left-3 top-3"
                    checked={selected.includes(p._id)}
                    onChange={() => toggleSelected(p._id)}
                  />
                  <div className="absolute right-1 top-1 bg-ink/70">
                    {rowActions(p)}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="block truncate font-display text-sm font-semibold uppercase text-paper hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm text-paper">
                      {formatPrice(p.price?.amount, p.price?.currency)}
                    </span>
                    <StatusBadge status={productStatus(p)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-xs uppercase tracking-wide text-muted">
            Showing {adminProductsMeta.total > 0 ? firstShown : 0}–
            {firstShown - 1 + adminProducts.length} of {adminProductsMeta.total}{' '}
            products
          </p>
          <Pagination
            page={adminProductsMeta.page}
            pages={adminProductsMeta.pages}
            onChange={(nextPage) => {
              setPage(nextPage);
              setSelected([]);
            }}
          />
        </footer>
      </div>
    </AdminLayout>
  );
};

export default AllAdminProducts;
