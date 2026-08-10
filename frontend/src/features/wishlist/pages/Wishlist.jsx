import { Link } from 'react-router';
import { FiHeart, FiX, FiChevronDown } from 'react-icons/fi';
import Header from '../../products/components/Header.jsx';

/* ------------------------------------------------------------------ */
/* "Wishlist" — follows the STITCH Google-Stitch design.               */
/* Static/presentational only: the saved items below are hard-coded    */
/* placeholders. Wire to the wishlist API + slice when the backend     */
/* routes land.                                                        */
/* ------------------------------------------------------------------ */

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// Local assets only — no external image host to go down on us.
const savedItems = [
  {
    id: 'aegis-shell-jacket',
    category: 'Outerwear',
    title: 'Aegis Shell Jacket',
    price: 12450,
    image: '/images/collection/parka.jpg',
    size: 'M',
    colorway: { name: 'Onyx', hex: '#111111' },
    inStock: true,
  },
  {
    id: 'vanguard-cargo',
    category: 'Bottoms',
    title: 'Vanguard Cargo',
    price: 5980,
    compareAtPrice: 7480,
    image: '/images/products/cargo.jpg',
    size: 'L',
    colorway: { name: 'Olive', hex: '#3b3f2b' },
    inStock: true,
  },
  {
    id: 'nightshade-anorak',
    category: 'Outerwear',
    title: 'Nightshade Anorak',
    price: 9320,
    image: '/images/collection/onyx.jpg',
    size: 'S',
    colorway: { name: 'Void', hex: '#0a0a0a' },
    inStock: false,
  },
  {
    id: 'tactical-sling',
    category: 'Accessories',
    title: 'Tactical Sling',
    price: 3145,
    image: '/images/collection/sling.jpg',
    size: 'OS',
    colorway: { name: 'Ash', hex: '#5f5f5f' },
    inStock: true,
  },
];

const recommendations = [
  {
    id: 'kinetic-gloves',
    category: 'Accessories',
    title: 'Kinetic Gloves',
    price: 2085,
    image: '/images/collection/striker.jpg',
  },
  {
    id: 'base-tee-01',
    category: 'Tops',
    title: 'Base Tee 01',
    price: 2110,
    image: '/images/cart/tee.jpg',
  },
  {
    id: 'tread-x-1',
    category: 'Footwear',
    title: 'Tread X-1',
    price: 8390,
    image: '/images/collection/boot.jpg',
  },
  {
    id: 'cobra-belt',
    category: 'Accessories',
    title: 'Cobra Belt',
    price: 1995,
    image: '/images/cart/belt.jpg',
  },
];

const filters = ['All', 'In Stock', 'On Sale', 'Sold Out'];

const Wishlist = () => {
  const itemCount = savedItems.length;

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
            <button
              type="button"
              className={`${labelCaps} text-muted transition-colors hover:text-red-400`}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Filter + sort bar */}
        <div className="mb-10 flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`${labelCaps} border px-4 py-2 transition-colors ${
                  index === 0
                    ? 'border-accent text-accent'
                    : 'border-line text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className={`${labelCaps} text-muted`}>Sort By</span>
            <div className="relative">
              <select
                defaultValue="recent"
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

        {/* Saved items */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {savedItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col border border-line bg-field transition-colors hover:border-accent"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <img
                  src={item.image}
                  alt={item.title}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    item.inStock ? '' : 'opacity-40 grayscale'
                  }`}
                />

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
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-ink/70 text-paper backdrop-blur-sm transition-colors hover:text-red-400"
                >
                  <FiX className="h-4 w-4" />
                </button>

                {!item.inStock && (
                  <span
                    className={`${labelCaps} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-line bg-ink/80 px-4 py-2 text-paper`}
                  >
                    Sold Out
                  </span>
                )}

                {item.compareAtPrice && item.inStock && (
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
                <h2
                  className={`mb-2 font-display text-xl font-semibold uppercase tracking-tight ${
                    item.inStock ? 'text-paper' : 'text-muted'
                  }`}
                >
                  {item.title}
                </h2>

                <div className="mb-3 flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold text-accent">
                    {formatMoney(item.price)}
                  </span>
                  {item.compareAtPrice && (
                    <span className="font-display text-sm text-faint line-through">
                      {formatMoney(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Saved variant */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`${labelCaps} border border-line px-3 py-1 text-muted`}
                  >
                    Size: <span className="text-paper">{item.size}</span>
                  </span>
                  <span
                    className={`${labelCaps} flex items-center gap-1.5 border border-line px-3 py-1 text-muted`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-line"
                      style={{ backgroundColor: item.colorway.hex }}
                    />
                    <span className="text-paper">{item.colorway.name}</span>
                  </span>
                </div>

                {item.inStock ? (
                  <button
                    type="button"
                    className={`${labelCaps} mt-auto w-full rounded-[4px] bg-accent py-4 text-ink transition hover:brightness-110 active:scale-[0.98]`}
                  >
                    Move to Bag
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${labelCaps} mt-auto w-full rounded-[4px] border border-line py-4 text-muted transition-colors hover:border-paper hover:text-paper`}
                  >
                    Notify Me
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Recommendations */}
        <section className="mt-16">
          <h2 className="mb-8 border-l-4 border-accent pl-4 font-display text-2xl font-semibold uppercase tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {recommendations.map((item) => (
              <div key={item.id} className="group">
                <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-field">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className={`${labelCaps} mb-1 text-[10px] text-muted`}>
                  {item.category}
                </p>
                <h3 className="font-display text-sm font-bold uppercase tracking-tight text-paper">
                  {item.title}
                </h3>
                <p className="mt-1 font-display text-sm text-accent">
                  {formatMoney(item.price)}
                </p>
              </div>
            ))}
          </div>
        </section>
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
