import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { FiHeart, FiX, FiChevronDown, FiBell } from 'react-icons/fi';
import Header from '../../products/components/Header.jsx';
import ProductCard from '../../products/components/ProductCard.jsx';
import { useWishlist } from '../hook/useWishlist.js';
import { useCart } from '../../cart/hook/useCart.js';
import { useProduct } from '../../products/hook/useProduct.js';

/* ------------------------------------------------------------------ */
/* "Wishlist" — follows the STITCH Google-Stitch design, driven by the */
/* live wishlist state.                                                */
/* ------------------------------------------------------------------ */

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// Prefer the saved variant's price/image/stock, else fall back to the product's.
const getVariant = (item) =>
  item.variantId
    ? item.product.variants?.find(
        (v) => String(v._id) === String(item.variantId),
      )
    : null;

const filters = {
  All: () => true,
  'In Stock': (item) => item.inStock,
  'On Sale': (item) => item.onSale,
  'Sold Out': (item) => !item.inStock,
};

const sorters = {
  recent: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
  'price-desc': (a, b) => b.price - a.price,
  'price-asc': (a, b) => a.price - b.price,
};

const Wishlist = () => {
  const {
    items,
    handleRemoveWishlistItem,
    handleMoveToCart,
    handleToggleNotify,
    handleClearWishlist,
  } = useWishlist();
  const { handleGetCart } = useCart();
  const { handleGetAllProducts } = useProduct();
  const { errors } = useSelector((state) => state.wishlist);
  const { allProducts } = useSelector((state) => state.product);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('recent');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    handleGetAllProducts({ limit: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard against saved items whose product was removed after being saved.
  const savedItems = items
    .filter((item) => item?.product)
    .map((item) => {
      const variant = getVariant(item);
      const price = variant?.price?.amount ?? item.product.price?.amount;
      const stock = variant?.stock ?? item.product.stock;
      return {
        id: item._id,
        productId: item.product._id,
        slug: item.product.slug || item.product._id,
        category: item.product.category || 'Apparel',
        title: item.product.title,
        price,
        compareAtPrice: item.product.compareAtPrice,
        onSale: item.product.compareAtPrice > price,
        image:
          variant?.images?.[0]?.url ||
          item.product.images?.[0]?.url ||
          '/placeholder.jpg',
        size: item.size,
        colorway: item.colorway,
        notifyMe: item.notifyMe,
        addedAt: item.createdAt,
        inStock:
          item.product.status === 'active' &&
          (item.product.trackQuantity === false || stock > 0),
      };
    });
  const itemCount = savedItems.length;
  const visibleItems = savedItems
    .filter(filters[filter])
    .sort(sorters[sort]);

  // Real products the shopper hasn't saved yet.
  const savedIds = new Set(savedItems.map((item) => item.productId));
  const recommendations = allProducts
    .filter((product) => !savedIds.has(product._id))
    .slice(0, 4);

  const handleMoveToBag = async (itemId) => {
    const result = await handleMoveToCart(itemId);
    // Keep the header bag badge in sync.
    if (result.success) handleGetCart();
  };

  const onToggleNotify = async (item) => {
    const result = await handleToggleNotify(item.id, !item.notifyMe);
    setNotice(result.success ? result.message : null);
  };

  const onClearAll = () => {
    if (window.confirm('Remove every item from your wishlist?')) {
      handleClearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            Home / Wishlist
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
                Wishlist
              </h1>
              <span className="font-display text-2xl font-semibold text-muted opacity-60">
                ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
              </span>
            </div>
            {itemCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className={`${labelCaps} text-muted transition-colors hover:text-red-400`}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter + sort bar */}
        <div className="mb-10 flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.keys(filters).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={filter === name}
                onClick={() => setFilter(name)}
                className={`${labelCaps} border px-4 py-2 transition-colors ${
                  filter === name
                    ? 'border-accent text-accent'
                    : 'border-line text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className={`${labelCaps} text-muted`}>Sort By</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={`${labelCaps} appearance-none border border-line bg-field py-2 pl-4 pr-10 text-paper outline-none transition-colors focus:border-accent`}
              >
                <option value="recent">Recently Added</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {errors && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-red-400">
            {errors}
          </p>
        )}
        {notice && !errors && (
          <p className="mb-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-emerald-400">
            {notice}
          </p>
        )}

        {itemCount === 0 && (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-6 border border-line bg-field py-24 text-center">
            <FiHeart className="h-10 w-10 text-muted" />
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight">
                Your wishlist is empty
              </h2>
              <p className="font-display text-[11px] uppercase tracking-wide text-muted">
                Tap the heart on any product to save it here.
              </p>
            </div>
            <Link
              to="/"
              className="border border-paper px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {itemCount > 0 && visibleItems.length === 0 && (
          <p className="border border-line bg-field py-16 text-center font-display text-xs uppercase tracking-[0.12em] text-muted">
            No saved items match this filter.
          </p>
        )}

        {/* Saved items */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col border border-line bg-field transition-colors hover:border-accent"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      item.inStock ? '' : 'opacity-40 grayscale'
                    }`}
                  />
                </Link>

                {/* Saved indicator */}
                <span
                  aria-label="Saved"
                  className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center bg-ink/70 backdrop-blur-sm"
                >
                  <FiHeart className="h-4 w-4 fill-accent text-accent" />
                </span>

                {/* Remove */}
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from wishlist`}
                  onClick={() =>
                    handleRemoveWishlistItem(item.id, item.productId)
                  }
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-ink/70 text-paper backdrop-blur-sm transition-colors hover:text-red-400"
                >
                  <FiX className="h-4 w-4" />
                </button>

                {!item.inStock && (
                  <span
                    className={`${labelCaps} pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-line bg-ink/80 px-4 py-2 text-paper`}
                  >
                    Sold Out
                  </span>
                )}

                {item.onSale && item.inStock && (
                  <span
                    className={`${labelCaps} absolute bottom-3 left-3 bg-accent px-2 py-1 text-ink`}
                  >
                    Sale
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className={`${labelCaps} mb-1 text-[10px] text-muted`}>
                  {item.category}
                </p>
                <Link
                  to={`/product/${item.slug}`}
                  className={`mb-2 font-display text-xl font-semibold uppercase tracking-tight transition-colors hover:text-accent ${
                    item.inStock ? 'text-paper' : 'text-muted'
                  }`}
                >
                  {item.title}
                </Link>

                <div className="mb-3 flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold text-accent">
                    {formatMoney(item.price)}
                  </span>
                  {item.onSale && (
                    <span className="font-display text-sm text-faint line-through">
                      {formatMoney(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Saved variant */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {item.size && (
                    <span
                      className={`${labelCaps} border border-line px-3 py-1 text-muted`}
                    >
                      Size: <span className="text-paper">{item.size}</span>
                    </span>
                  )}
                  {item.colorway?.name && (
                    <span
                      className={`${labelCaps} flex items-center gap-1.5 border border-line px-3 py-1 text-muted`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-line"
                        style={{ backgroundColor: item.colorway.hex }}
                      />
                      <span className="text-paper">{item.colorway.name}</span>
                    </span>
                  )}
                </div>

                {item.inStock ? (
                  <button
                    type="button"
                    onClick={() => handleMoveToBag(item.id)}
                    className={`${labelCaps} mt-auto w-full rounded-[4px] bg-accent py-4 text-ink transition hover:brightness-110 active:scale-[0.98]`}
                  >
                    Move to Bag
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-pressed={item.notifyMe}
                    onClick={() => onToggleNotify(item)}
                    className={`${labelCaps} mt-auto flex w-full items-center justify-center gap-2 rounded-[4px] border py-4 transition-colors ${
                      item.notifyMe
                        ? 'border-accent text-accent'
                        : 'border-line text-muted hover:border-paper hover:text-paper'
                    }`}
                  >
                    <FiBell className="h-4 w-4" />
                    {item.notifyMe ? "We'll Email You" : 'Notify Me'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 border-l-4 border-accent pl-4 font-display text-2xl font-semibold uppercase tracking-tight">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full border-t border-line bg-surface py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <Link
            to="/"
            className="font-display text-2xl font-bold uppercase tracking-tight text-paper"
          >
            STITCH
          </Link>
          <nav className="flex gap-8">
            {['Archive', 'Stores', 'Shipping', 'Legal'].map((l) => (
              <a
                key={l}
                href="#"
                className="font-display text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-paper"
              >
                {l}
              </a>
            ))}
          </nav>
          <p className="font-display text-[10px] uppercase tracking-[0.15em] text-muted">
            © 2024 STITCH. Engineered for the fringe.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Wishlist;
