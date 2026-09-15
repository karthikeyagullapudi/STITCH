import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { FiArrowUpRight, FiAtSign } from 'react-icons/fi';
import Header from '../../components/Header.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import { useProduct } from '../../hook/useProduct.js';
import { useNewsletter } from '../../../newsletter/hook/useNewsletter.js';
import { formatPrice } from '../../../../shared/utils/format.js';

/* ------------------------------------------------------------------ */
/* STITCH landing page — editorial sections around the newest drops.  */
/* ------------------------------------------------------------------ */

const categories = [
  {
    img: 'cat-men',
    label: "Men's Clothing",
    path: '/collections/mens',
  },
  {
    img: 'cat-accessories',
    label: 'Accessories',
    path: '/collections/accessories',
  },
  {
    img: 'cat-women',
    label: "Women's Clothing",
    path: '/collections/women',
  },
];

const instagram = ['ig-1', 'ig-2', 'ig-3', 'ig-4', 'ig-5'];

const footerCols = [
  {
    title: 'Shop',
    links: [
      ['New Arrivals', '/collections/all'],
      ['Men', '/collections/mens'],
      ['Women', '/collections/women'],
      ['Accessories', '/collections/accessories'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['Shipping', '/pages/shipping'],
      ['Returns', '/pages/returns'],
      ['Contact', '/pages/contact'],
      ['Stores', '/pages/stores'],
    ],
  },
];

const legalLinks = [
  ['Privacy', '/pages/privacy'],
  ['Terms', '/pages/terms'],
  ['Accessibility', '/pages/accessibility'],
];

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const LandingPage = () => {
  const { handleGetAllProducts } = useProduct();
  const { handleSubscribe } = useNewsletter();
  const { allProducts, productsMeta } = useSelector((state) => state.product);
  const [email, setEmail] = useState('');
  const [newsletterResult, setNewsletterResult] = useState(null);

  useEffect(() => {
    handleGetAllProducts({ sort: 'newest', limit: 4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newArrivals = allProducts.slice(0, 4);
  const featured = newArrivals[0];

  const onSubscribe = async (e) => {
    e.preventDefault();
    const result = await handleSubscribe(email);
    setNewsletterResult(result);
    if (result.success) setEmail('');
  };

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[620px] w-full overflow-hidden md:h-[860px]">
          <img
            src="/images/landing/hero.jpg"
            alt="STITCH SS23"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16">
            <div className="flex max-w-2xl flex-col items-start gap-4">
              <div className="flex flex-col leading-none">
                <span className="font-display text-6xl font-bold leading-none text-white md:text-[72px]">
                  SS23
                </span>
                <span className="font-display text-6xl font-bold leading-none text-accent md:text-[72px]">
                  SALE
                </span>
              </div>
              <p className="max-w-md text-lg text-white/70">
                Engineered for the urban environment. Discover our Spring/Summer
                2023 technical collection at exclusive end-of-season rates.
              </p>
            </div>

            {/* Floating product chip — the newest drop */}
            {featured && (
              <div className="absolute bottom-16 right-6 hidden border border-line bg-surface p-2 backdrop-blur-sm md:block">
                <div className="flex items-center gap-4">
                  <img
                    src={featured.images?.[0]?.url || '/placeholder.jpg'}
                    alt={featured.title}
                    className="h-16 w-16 object-cover"
                  />
                  <div>
                    <p className={`${labelCaps} text-paper`}>{featured.title}</p>
                    <p className="font-display text-sm text-accent">
                      {formatPrice(featured.price?.amount, featured.price?.currency)}
                    </p>
                  </div>
                  <Link
                    to={`/product/${featured.slug || featured._id}`}
                    className={`${labelCaps} bg-accent px-4 py-2 text-[10px] text-ink transition-transform hover:scale-105 active:scale-95`}
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
                New Arrivals
              </h2>
              <span className="font-display text-lg text-muted">
                / {productsMeta.total} Items
              </span>
            </div>
            <Link
              to="/collections/all"
              className={`${labelCaps} border border-paper px-6 py-2.5 text-paper transition-all hover:bg-paper hover:text-ink`}
            >
              Shop All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:h-[600px] lg:gap-8">
            {categories.map((c) => (
              <Link
                key={c.label}
                to={c.path}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-line md:aspect-auto"
              >
                <img
                  src={`/images/landing/${c.img}.jpg`}
                  alt={c.label}
                  className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="mb-3 font-display text-2xl font-bold uppercase text-white">
                    {c.label}
                  </h3>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
                    <FiArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Collection feature */}
        <section className="border-y border-line bg-surface py-16">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-6 md:grid-cols-2">
            <div className="order-2 flex flex-col items-start gap-8 md:order-1">
              <div>
                <p className={`${labelCaps} mb-3 text-accent`}>Lunacore PF23</p>
                <h2 className="mb-4 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
                  Lunacore Collection
                </h2>
                <p className="max-w-md text-lg text-muted">
                  Inspired by lunar exploration and extreme climate resilience.
                  This limited pre-fall collection merges high-spec performance
                  with avant-garde lunar aesthetics.
                </p>
              </div>
              <Link
                to={`/collections/all?collection=${encodeURIComponent('SS24 LUNACORE')}`}
                className={`${labelCaps} border-2 border-paper px-10 py-3.5 text-paper transition-all hover:bg-paper hover:text-ink`}
              >
                View Collection
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/images/landing/lunacore.jpg"
                alt="Lunacore Collection"
                className="aspect-square w-full border border-line object-cover"
              />
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="mb-8 flex items-center gap-3">
            <FiAtSign className="h-5 w-5 text-accent" />
            <h2 className={`${labelCaps} tracking-[0.2em]`}>
              Follow us @STITCH_TECH
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {instagram.map((ig) => (
              <div key={ig} className="group aspect-square overflow-hidden">
                <img
                  src={`/images/landing/${ig}.jpg`}
                  alt="STITCH on Instagram"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line bg-surface py-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="font-display text-2xl font-bold text-paper">
              STITCH
            </span>
            <p className="max-w-xs text-sm text-muted">
              Technical apparel designed for the modern nomad. Fusing Japanese
              structuralism with high-performance utility.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className={`${labelCaps} mb-6 text-paper`}>{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className={`${labelCaps} text-muted transition-colors hover:text-accent`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className={`${labelCaps} mb-6 text-paper`}>Newsletter</h4>
            <p className="mb-4 text-sm text-muted">
              Join the collective for early access and tactical updates.
            </p>
            <form
              onSubmit={onSubscribe}
              className="flex border border-line focus-within:border-accent"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-panel px-3 py-2.5 font-display text-xs uppercase tracking-wide text-paper outline-none placeholder:text-faint"
              />
              <button
                type="submit"
                className={`${labelCaps} bg-paper px-4 text-ink transition-colors hover:bg-accent`}
              >
                Join
              </button>
            </form>
            {newsletterResult && (
              <p
                className={`mt-2 font-display text-[11px] uppercase tracking-wide ${
                  newsletterResult.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {newsletterResult.message || newsletterResult.error}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1440px] flex-col justify-between gap-4 border-t border-line px-6 pt-8 md:flex-row">
          <p className="font-display text-[10px] uppercase tracking-wide text-muted">
            © {new Date().getFullYear()} STITCH Techwear. All rights reserved.
          </p>
          <div className="flex gap-8">
            {legalLinks.map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="font-display text-[10px] uppercase tracking-wide text-muted hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
