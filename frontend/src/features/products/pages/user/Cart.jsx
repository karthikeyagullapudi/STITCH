import { FiChevronDown, FiTrash2, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import Header from '../../components/Header.jsx';

/* ------------------------------------------------------------------ */
/* Static STITCH cart / "Your Bag" page. Presentational only —        */
/* wire up cart state, qty/size selects, remove & checkout as needed. */
/* ------------------------------------------------------------------ */

const cartItems = [
  { img: 'kimono', cat: 'Outerwear / Archive', name: 'Kimono Lu Xang', size: 'L', qty: 1, price: '$485.00', old: '$520.00' },
  { img: 'andras', cat: 'Tops / Performance', name: 'Andras Stalker', size: 'M', qty: 1, price: '$290.00' },
  { img: 'cargo', cat: 'Bottoms / Cargo', name: 'Tactical Cargo Pant', size: '32', qty: 1, price: '$340.00' },
];

const summary = [
  { label: 'Subtotal', value: '$1,115.00' },
  { label: 'Shipping', value: 'Free', accent: true },
  { label: 'Estimated Tax', value: '$92.00' },
];

const suggestions = [
  { img: 'sling', cat: 'Accessories', name: 'Sling Carrier V2', price: '$145.00' },
  { img: 'tee', cat: 'Tops', name: 'Base Layer Tee', price: '$85.00' },
  { img: 'belt', cat: 'Accessories', name: 'Rigid Cobra Belt', price: '$110.00' },
  { img: 'boot', cat: 'Footwear', name: 'Stalker Boot V1', price: '$380.00' },
];

const pillCls =
  'flex items-center gap-1 border border-line px-3 py-1 font-display text-[11px] uppercase tracking-wide text-muted';

const Cart = () => {
  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Home / Bag</p>
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">Your Bag</h1>
            <span className="font-display text-2xl font-semibold text-muted opacity-60">(3 Items)</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left — cart items */}
          <div className="w-full space-y-4 lg:w-[65%]">
            {cartItems.map((item) => (
              <div
                key={item.name}
                className="group flex flex-col gap-4 border border-line bg-field p-4 transition-colors hover:border-accent sm:flex-row"
              >
                <div className="h-40 w-full overflow-hidden bg-panel sm:w-32">
                  <img
                    src={`/images/cart/${item.img}.jpg`}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {item.cat}
                      </span>
                      <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-paper">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className={pillCls}>
                          Size: <span className="text-paper">{item.size}</span>
                          <FiChevronDown className="h-3.5 w-3.5" />
                        </div>
                        <div className={pillCls}>
                          Qty: <span className="text-paper">{item.qty}</span>
                          <FiChevronDown className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-paper">{item.price}</p>
                      {item.old && (
                        <p className="font-display text-[11px] text-muted line-through">{item.old}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      className="p-1 text-muted transition-colors hover:text-red-400"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Action bar */}
            <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
              <a
                href="#"
                className="w-full border border-paper px-10 py-4 text-center font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink sm:w-auto"
              >
                Continue Shopping
              </a>
              <div className="flex h-12 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  className="w-full border border-r-0 border-line bg-panel px-4 font-display text-[11px] uppercase tracking-wide text-paper outline-none transition-colors placeholder:text-faint focus:border-accent sm:w-48"
                />
                <button
                  type="button"
                  className="bg-accent px-8 font-display text-[11px] font-bold uppercase tracking-wide text-ink transition hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="w-full lg:w-[35%]">
            <div className="sticky top-28 flex flex-col gap-4 border border-line bg-field p-8">
              <h2 className="border-b border-line pb-4 font-display text-2xl font-semibold uppercase tracking-tight">
                Order Summary
              </h2>
              <div className="space-y-2 py-2">
                {summary.map((row) => (
                  <div key={row.label} className="flex justify-between text-base">
                    <span className="uppercase text-muted">{row.label}</span>
                    <span className={row.accent ? 'font-bold uppercase text-accent' : 'text-paper'}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="font-display text-2xl uppercase">Total</span>
                <span className="font-display text-3xl font-bold text-accent">$1,207.00</span>
              </div>
              <button
                type="button"
                className="w-full rounded-[4px] bg-accent py-4 font-display text-base font-extrabold uppercase tracking-[0.2em] text-ink transition hover:brightness-110 active:scale-[0.98]"
              >
                Checkout
              </button>
              <div className="mt-2 space-y-4">
                <div className="flex justify-center gap-5 text-muted/60">
                  <FiCreditCard className="h-7 w-7" />
                  <FiSmartphone className="h-7 w-7" />
                  <FiDollarSign className="h-7 w-7" />
                </div>
                <p className="border-t border-line pt-4 text-center font-display text-[10px] uppercase tracking-wide text-muted">
                  Free shipping over $200. Taxes calculated at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <section className="mt-16">
          <h2 className="mb-8 border-l-4 border-accent pl-4 font-display text-2xl font-semibold uppercase tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {suggestions.map((p) => (
              <div key={p.name} className="group cursor-pointer">
                <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-field">
                  <img
                    src={`/images/cart/${p.img}.jpg`}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className="rounded-[4px] bg-accent px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-ink transition-transform hover:scale-105"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
                <p className="mb-1 font-display text-[10px] uppercase tracking-wide text-muted">{p.cat}</p>
                <p className="font-display text-sm font-bold uppercase tracking-tight text-paper">{p.name}</p>
                <p className="mt-1 font-display text-sm text-accent">{p.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full border-t border-line bg-surface py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="font-display text-2xl font-bold uppercase tracking-tight text-paper">STITCH</div>
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

export default Cart;
