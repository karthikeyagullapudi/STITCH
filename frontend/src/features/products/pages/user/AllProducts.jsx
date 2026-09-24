import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useSelector } from 'react-redux';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { useProduct } from '../../hook/useProduct.js';
import Header from '../../components/Header.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import Footer from '../../../../shared/components/Footer.jsx';
import Pagination from '../../../../shared/components/Pagination.jsx';
import NotFound from '../../../../shared/pages/NotFound.jsx';

/* ------------------------------------------------------------------ */
/* Storefront listing for /collections/:collection. Filters, sort,     */
/* search and paging live in the URL so results are shareable.         */
/* ------------------------------------------------------------------ */

const collections = {
  all: { title: 'Shop All', subtitle: 'Every drop in the archive.' },
  mens: {
    title: "Men's Collection",
    subtitle: 'Engineered for the fringe.',
    query: { gender: 'men' },
  },
  women: {
    title: "Women's Collection",
    subtitle: 'Precision cut for movement.',
    query: { gender: 'women' },
  },
  accessories: {
    title: 'Accessories',
    subtitle: 'Carry systems and finishing hardware.',
    query: { category: 'Accessories' },
  },
};

const sorts = [
  ['newest', 'Newest'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
];

const groupTitle =
  'mb-4 border-b border-line pb-2 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-muted';
const checkLabel =
  'flex cursor-pointer items-center gap-2 font-display text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:text-paper';

const AllProducts = () => {
  const { collection } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleGetAllProducts } = useProduct();
  const { allProducts, productsMeta, loading } = useSelector(
    (state) => state.product,
  );
  const config = collections[collection];
  const { facets } = productsMeta;
  const query = searchParams.toString();

  useEffect(() => {
    if (config) {
      handleGetAllProducts({
        ...config.query,
        ...Object.fromEntries(searchParams),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, query]);

  const selected = (key) => searchParams.get(key)?.split(',') || [];

  // Any filter change sends the shopper back to the first page.
  const updateParams = (changes) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    if (!('page' in changes)) params.delete('page');
    setSearchParams(params);
  };

  const toggleFilter = (key, value) => {
    const values = selected(key);
    const next = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    updateParams({ [key]: next.join(',') });
  };

  if (!config) return <NotFound />;

  const searchTerm = searchParams.get('q');
  const hasFilters = ['category', 'size', 'tag'].some((key) =>
    searchParams.get(key),
  );

  return (
    <div className="flex min-h-screen flex-col bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto w-full flex-1 max-w-[1440px] px-6 pb-16 pt-28">
        {/* Collection header */}
        <section className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight md:text-6xl">
              {searchTerm ? `“${searchTerm}”` : config.title}
            </h1>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
              {config.subtitle} {productsMeta.total}{' '}
              {productsMeta.total === 1 ? 'item' : 'items'} available.
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => updateParams({ q: '' })}
                className="mt-3 flex items-center gap-1 font-display text-[11px] uppercase tracking-wide text-accent"
              >
                <FiX className="h-3 w-3" />
                Clear search
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="appearance-none border border-line bg-field py-2 pl-4 pr-10 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper outline-none focus:border-accent"
            >
              {sorts.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Filter sidebar */}
          <aside className="w-full flex-shrink-0 lg:w-60">
            <div className="space-y-8 lg:sticky lg:top-28">
              {/* Category (fixed on the accessories collection) */}
              {!config.query?.category && facets.categories.length > 0 && (
                <div>
                  <h3 className={groupTitle}>Category</h3>
                  <div className="flex flex-col gap-2">
                    {facets.categories.map((c) => (
                      <label key={c} className={checkLabel}>
                        <input
                          type="checkbox"
                          className="stitch-checkbox"
                          checked={selected('category').includes(c)}
                          onChange={() => toggleFilter('category', c)}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {facets.sizes.length > 0 && (
                <div>
                  <h3 className={groupTitle}>Size</h3>
                  <div className="grid grid-cols-5 gap-1.5">
                    {facets.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleFilter('size', s)}
                        className={`border py-2 font-display text-xs uppercase transition-colors ${
                          selected('size').includes(s)
                            ? 'border-accent text-accent'
                            : 'border-line text-muted hover:border-accent hover:text-accent'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {facets.tags.length > 0 && (
                <div>
                  <h3 className={groupTitle}>Technical</h3>
                  <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {facets.tags.map((t) => (
                      <label key={t} className={checkLabel}>
                        <input
                          type="checkbox"
                          className="stitch-checkbox"
                          checked={selected('tag').includes(t)}
                          onChange={() => toggleFilter('tag', t)}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => updateParams({ category: '', size: '', tag: '' })}
                  className="font-display text-[11px] uppercase tracking-wide text-accent"
                >
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-grow">
            {!loading && allProducts.length === 0 && (
              <p className="border border-line bg-field py-24 text-center font-display text-xs uppercase tracking-[0.12em] text-muted">
                No products match these filters.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {allProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Pagination
                page={productsMeta.page}
                pages={productsMeta.pages}
                onChange={(page) => updateParams({ page: String(page) })}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllProducts;
