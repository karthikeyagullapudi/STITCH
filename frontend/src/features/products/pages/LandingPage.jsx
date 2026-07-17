import { Link } from 'react-router';
import {
  FiShoppingBag,
  FiArrowUpRight,
  FiAtSign,
  FiShare2,
  FiGlobe,
  FiRss,
  FiMenu,
} from 'react-icons/fi';

/* ------------------------------------------------------------------ */
/* Static STITCH landing page (SS23). Presentational only —           */
/* wire up cart / data / handlers as needed.                          */
/* ------------------------------------------------------------------ */

const navLinks = ['New', 'Men', 'Women', 'Accessories'];

const newArrivals = [
  { img: 'na-parka', cat: 'Outerwear', name: 'Stealth Parka Gen-2', price: '$540.00', badge: true },
  { img: 'na-pullover', cat: 'Mid-Layer', name: 'Aero-Shell Pullover', price: '$225.00', featured: true },
  { img: 'na-cargo', cat: 'Trousers', name: 'Cargo System Pants', price: '$310.00' },
  { img: 'na-backpack', cat: 'Accessories', name: 'Nexus 20L Backpack', price: '$195.00' },
];

const categories = [
  { img: 'cat-men', label: "Men's Clothing" },
  { img: 'cat-accessories', label: 'Accessories' },
  { img: 'cat-women', label: "Women's Clothing" },
];

const instagram = ['ig-1', 'ig-2', 'ig-3', 'ig-4', 'ig-5'];

const footerCols = [
  { title: 'Shop', links: ['New Arrivals', 'Outerwear', 'Trousers', 'Accessories'] },
  { title: 'Support', links: ['Shipping', 'Returns', 'Contact', 'Stores'] },
];

const labelCaps = 'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      {/* Top nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-line bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-paper">
              STITCH
            </Link>
            <div className="hidden gap-8 md:flex">
              {navLinks.map((l, i) => (
                <a
                  key={l}
                  href="#"
                  className={`${labelCaps} transition-colors ${
                    i === 0
                      ? 'border-b-2 border-accent pb-1 text-accent'
                      : 'text-muted hover:text-accent'
                  }`}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className={`${labelCaps} hidden text-muted transition-colors hover:text-accent sm:block`}
            >
              Login
            </Link>
            <button type="button" aria-label="Cart" className="relative text-paper transition-transform active:scale-95">
              <FiShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
                2
              </span>
            </button>
            <button type="button" aria-label="Menu" className="text-paper md:hidden">
              <FiMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[620px] w-full overflow-hidden md:h-[860px]">
          <img src="/images/landing/hero.jpg" alt="STITCH SS23" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16">
            <div className="flex max-w-2xl flex-col items-start gap-4">
              <div className="flex flex-col leading-none">
                <span className="font-display text-6xl font-bold leading-none text-white md:text-[72px]">SS23</span>
                <span className="font-display text-6xl font-bold leading-none text-accent md:text-[72px]">SALE</span>
              </div>
              <p className="max-w-md text-lg text-white/70">
                Engineered for the urban environment. Discover our Spring/Summer 2023 technical collection at
                exclusive end-of-season rates.
              </p>
            </div>

            {/* Floating product chip */}
            <div className="absolute bottom-16 right-6 hidden border border-line bg-surface p-2 backdrop-blur-sm md:block">
              <div className="flex items-center gap-4">
                <img src="/images/landing/chip.jpg" alt="S-04 Modular Rig" className="h-16 w-16 object-cover" />
                <div>
                  <p className={`${labelCaps} text-paper`}>S-04 Modular Rig</p>
                  <p className="font-display text-sm text-accent">$189.00</p>
                </div>
                <button
                  type="button"
                  className={`${labelCaps} bg-accent px-4 py-2 text-[10px] text-ink transition-transform hover:scale-105 active:scale-95`}
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight">New Arrivals</h2>
              <span className="font-display text-lg text-muted">/ 42 Items</span>
            </div>
            <a
              href="#"
              className={`${labelCaps} border border-paper px-6 py-2.5 text-paper transition-all hover:bg-paper hover:text-ink`}
            >
              Shop All
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            {newArrivals.map((p) => (
              <div key={p.name} className="group cursor-pointer">
                <div className="relative mb-3 aspect-[3/4] overflow-hidden border border-transparent bg-field transition-all group-hover:border-accent">
                  <img
                    src={`/images/landing/${p.img}.jpg`}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.badge && (
                    <span className={`${labelCaps} absolute left-2 top-2 bg-accent px-2 py-1 text-[10px] text-ink`}>
                      New
                    </span>
                  )}
                  {p.featured && (
                    <div className="absolute bottom-0 left-0 w-full translate-y-2 p-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        type="button"
                        className={`${labelCaps} w-full bg-accent py-3 text-ink active:scale-95`}
                      >
                        Add to Bag
                      </button>
                    </div>
                  )}
                </div>
                <p className={`${labelCaps} mb-1 text-muted`}>{p.cat}</p>
                <h3 className="mb-1 font-display text-lg font-semibold uppercase text-paper">{p.name}</h3>
                <p className="font-display text-sm text-paper">{p.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:h-[600px] lg:gap-8">
            {categories.map((c) => (
              <div
                key={c.label}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-line md:aspect-auto"
              >
                <img
                  src={`/images/landing/${c.img}.jpg`}
                  alt={c.label}
                  className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="mb-3 font-display text-2xl font-bold uppercase text-white">{c.label}</h3>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
                    <FiArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
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
                  Inspired by lunar exploration and extreme climate resilience. This limited pre-fall collection
                  merges high-spec performance with avant-garde lunar aesthetics.
                </p>
              </div>
              <a
                href="#"
                className={`${labelCaps} border-2 border-paper px-10 py-3.5 text-paper transition-all hover:bg-paper hover:text-ink`}
              >
                View Collection
              </a>
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
            <h2 className={`${labelCaps} tracking-[0.2em]`}>Follow us @STITCH_TECH</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {instagram.map((ig) => (
              <a key={ig} href="#" className="group aspect-square overflow-hidden">
                <img
                  src={`/images/landing/${ig}.jpg`}
                  alt="STITCH on Instagram"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line bg-surface py-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="font-display text-2xl font-bold text-paper">STITCH</span>
            <p className="max-w-xs text-sm text-muted">
              Technical apparel designed for the modern nomad. Fusing Japanese structuralism with high-performance
              utility.
            </p>
            <div className="mt-2 flex gap-4">
              {[FiShare2, FiGlobe, FiRss].map((Icon, i) => (
                <a key={i} href="#" className="text-muted transition-colors hover:text-accent">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className={`${labelCaps} mb-6 text-paper`}>{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className={`${labelCaps} text-muted transition-colors hover:text-accent`}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className={`${labelCaps} mb-6 text-paper`}>Newsletter</h4>
            <p className="mb-4 text-sm text-muted">Join the collective for early access and tactical updates.</p>
            <div className="flex border border-line focus-within:border-accent">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-panel px-3 py-2.5 font-display text-xs uppercase tracking-wide text-paper outline-none placeholder:text-faint"
              />
              <button
                type="button"
                className={`${labelCaps} bg-paper px-4 text-ink transition-colors hover:bg-accent`}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1440px] flex-col justify-between gap-4 border-t border-line px-6 pt-8 md:flex-row">
          <p className="font-display text-[10px] uppercase tracking-wide text-muted">
            © 2023 STITCH Techwear. All rights reserved.
          </p>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Accessibility'].map((l) => (
              <a key={l} href="#" className="font-display text-[10px] uppercase tracking-wide text-muted hover:text-accent">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
