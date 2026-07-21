import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../../hook/useProduct.js';
import Header from '../../components/Header.jsx';

const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
const formatPrice = (price) => {
  if (!price) return '';
  const symbol = currencySymbols[price.currency] || '₹';
  return `${symbol}${price.amount}`;
};

/* ------------------------------------------------------------------ */
/* Static STITCH "Men's Collection" storefront listing.               */
/* Presentational only — wire product data / filters / cart as needed.*/
/* ------------------------------------------------------------------ */

const filters = {
  category: ['Outerwear', 'Tops', 'Bottoms', 'Footwear'],
  size: ['XS', 'S', 'M', 'L', 'XL'],
  technical: ['Waterproof', 'Windproof', 'Breathable'],
};

const groupTitle =
  'mb-4 border-b border-line pb-2 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-muted';
const checkLabel =
  'flex cursor-pointer items-center gap-2 font-display text-xs uppercase tracking-[0.05em] text-muted transition-colors hover:text-paper';

const AllProducts = () => {
  const { handleGetAllProducts } = useProduct();
  const { allProducts } = useSelector((state) => state.product);
  const navigate = useNavigate();

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28">
        {/* Collection header */}
        <section className="mb-12">
          <h1 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight md:text-6xl">
            Men&apos;s Collection
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
            Engineered for the fringe. 18 items available.
          </p>
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Filter sidebar */}
          <aside className="w-full flex-shrink-0 lg:w-60">
            <div className="space-y-8 lg:sticky lg:top-28">
              {/* Category */}
              <div>
                <h3 className={groupTitle}>Category</h3>
                <div className="flex flex-col gap-2">
                  {filters.category.map((c) => (
                    <label key={c} className={checkLabel}>
                      <input type="checkbox" className="stitch-checkbox" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className={groupTitle}>Size</h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {filters.size.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="border border-line py-2 font-display text-xs uppercase text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical */}
              <div>
                <h3 className={groupTitle}>Technical</h3>
                <div className="flex flex-col gap-2">
                  {filters.technical.map((t) => (
                    <label key={t} className={checkLabel}>
                      <input type="checkbox" className="stitch-checkbox" />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="grid flex-grow grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {allProducts.map((p) => (
              <article
                onClick={() => {
                  navigate(`/product/${p._id}`);
                }}
                key={p._id}
                className="group relative overflow-hidden border border-line bg-panel transition-colors hover:border-accent"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-field">
                  <img
                    src={p.images?.[0]?.url || '/placeholder.jpg'}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.collectionName && (
                    <span className="absolute right-3 top-3 bg-accent px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-ink">
                      {p.collectionName}
                    </span>
                  )}
                  {/* Hover feature overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/60 p-6 text-center opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <span className="font-display text-[11px] font-bold uppercase leading-relaxed tracking-[0.12em] text-accent line-clamp-3">
                      {p.description}
                    </span>
                    <Link
                      to={`/product/${p._id}`}
                      className="border border-accent bg-accent px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition active:scale-95"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold uppercase tracking-tight text-paper truncate">
                      {p.title}
                    </h2>
                    <span className="shrink-0 font-display text-xl font-semibold text-accent">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span className="font-display text-[11px] uppercase tracking-wide">
                      SKU: {p.sku || 'N/A'}
                    </span>
                    <span className="font-display text-[11px] uppercase tracking-wide">
                      {p.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="font-display text-2xl font-bold uppercase tracking-tight text-paper">
              STITCH
            </span>
            <p className="font-display text-[11px] uppercase tracking-wide text-muted">
              © 2024 STITCH Technical Apparel. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            {['Shipping', 'Returns', 'Privacy', 'Terms'].map((l) => (
              <a
                key={l}
                href="#"
                className="font-display text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-accent"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllProducts;
