import { useEffect } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
} from 'react-icons/fi';
import Header from '../../products/components/Header.jsx';
import { useCart } from '../hook/useCart.js';
import { useProduct } from '../../products/hook/useProduct.js';

/* ------------------------------------------------------------------ */
/* "Your Bag" — follows the STITCH Google-Stitch design, driven by the */
/* live cart state from the cart feature.                              */
/* ------------------------------------------------------------------ */

// Estimate only — real tax is finalised at checkout (matches the design copy).
const TAX_RATE = 0.18;

const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

const formatMoney = (amount, currency = 'INR') =>
  `${currencySymbols[currency] || '₹'}${Number(amount || 0).toLocaleString()}`;

// Prefer the selected variant's price/image, else fall back to the product's.
const getVariant = (item) =>
  item.variantId && item.product?.variants?.length
    ? item.product.variants.find(
        (v) => String(v._id) === String(item.variantId),
      )
    : null;

const getItemPrice = (item) => {
  const variant = getVariant(item);
  if (variant?.price?.amount != null) return variant.price;
  return item.product?.price || { amount: 0, currency: 'INR' };
};

const getItemImage = (item) => {
  const variant = getVariant(item);
  return (
    variant?.images?.[0]?.url ||
    item.product?.images?.[0]?.url ||
    '/placeholder.jpg'
  );
};

const pillCls =
  'flex items-center gap-1.5 border border-line px-3 py-1 font-display text-[11px] uppercase tracking-wider text-muted';

const Cart = () => {
  const {
    handleGetCart,
    handleUpdateCartItem,
    handleRemoveCartItem,
    handleClearCart,
    handleAddToCart,
  } = useCart();
  const { handleGetAllProducts } = useProduct();
  const { items, errors } = useSelector((state) => state.cart);
  const { allProducts } = useSelector((state) => state.product);

  useEffect(() => {
    handleGetCart();
    handleGetAllProducts();
  }, []);

  // Guard against line items whose product was removed after being added.
  const validItems = items.filter((item) => item.product);
  const currency = getItemPrice(validItems[0] || {}).currency || 'INR';
  const subtotal = validItems.reduce(
    (sum, item) => sum + getItemPrice(item).amount * item.quantity,
    0,
  );
  const totalUnits = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // Storefront suggestions — real products not already in the bag.
  const cartProductIds = new Set(validItems.map((i) => i.product._id));
  const suggestions = allProducts
    .filter((p) => !cartProductIds.has(p._id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            Home / Bag
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
                Your Bag
              </h1>
              <span className="font-display text-2xl font-semibold text-muted opacity-60">
                ({totalUnits} {totalUnits === 1 ? 'Item' : 'Items'})
              </span>
            </div>
            {validItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="font-display text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-red-400"
              >
                Clear Bag
              </button>
            )}
          </div>
        </div>

        {errors && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-red-400">
            {errors}
          </p>
        )}

        {validItems.length === 0 ? (
          /* Empty state */
          <div className="mb-16 flex flex-col items-center justify-center gap-6 border border-line bg-field py-24 text-center">
            <FiShoppingBag className="h-10 w-10 text-muted" />
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight">
                Your bag is empty
              </h2>
              <p className="font-display text-[11px] uppercase tracking-wide text-muted">
                Add something from the archive to get started.
              </p>
            </div>
            <Link
              to="/"
              className="border border-paper px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left — cart items */}
            <div className="w-full space-y-4 lg:w-[65%]">
              {validItems.map((item) => {
                const price = getItemPrice(item);
                return (
                  <div
                    key={item._id}
                    className="group flex flex-col gap-4 border border-line bg-field p-4 transition-colors duration-300 hover:border-accent sm:flex-row"
                  >
                    <Link
                      to={`/product/${item.product._id}`}
                      className="h-40 w-full overflow-hidden bg-surface sm:w-32"
                    >
                      <img
                        src={getItemImage(item)}
                        alt={item.product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                            {item.product.category || 'Apparel'}
                          </span>
                          <Link
                            to={`/product/${item.product._id}`}
                            className="font-display text-2xl font-semibold uppercase tracking-tight text-paper transition-colors hover:text-accent"
                          >
                            {item.product.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.size && (
                              <div className={pillCls}>
                                Size:{' '}
                                <span className="text-paper">{item.size}</span>
                              </div>
                            )}
                            {item.colorway?.name && (
                              <div className={pillCls}>
                                {item.colorway.hex && (
                                  <span
                                    className="h-3 w-3 rounded-full border border-line"
                                    style={{
                                      backgroundColor: item.colorway.hex,
                                    }}
                                  />
                                )}
                                <span className="text-paper">
                                  {item.colorway.name}
                                </span>
                              </div>
                            )}
                            {/* Qty stepper — styled to match the pills */}
                            <div className="flex items-center border border-line font-display text-[11px] uppercase tracking-wider text-muted">
                              <span className="pl-3 pr-1">Qty</span>
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  handleUpdateCartItem(
                                    item._id,
                                    Math.max(1, item.quantity - 1),
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center text-paper transition-colors hover:text-accent"
                              >
                                <FiMinus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-paper">
                                {String(item.quantity).padStart(2, '0')}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  handleUpdateCartItem(
                                    item._id,
                                    item.quantity + 1,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center text-paper transition-colors hover:text-accent"
                              >
                                <FiPlus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl text-paper">
                            {formatMoney(
                              price.amount * item.quantity,
                              price.currency,
                            )}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-display text-[11px] text-muted">
                              {formatMoney(price.amount, price.currency)} each
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item._id)}
                          aria-label={`Remove ${item.product.title}`}
                          className="p-1 text-muted transition-colors hover:text-red-400"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Action bar */}
              <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
                <Link
                  to="/"
                  className="w-full border border-paper px-10 py-4 text-center font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink sm:w-auto"
                >
                  Continue Shopping
                </Link>
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
                  <div className="flex justify-between text-base">
                    <span className="uppercase text-muted">Subtotal</span>
                    <span className="text-paper">
                      {formatMoney(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="uppercase text-muted">Shipping</span>
                    <span className="font-bold uppercase text-accent">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="uppercase text-muted">Estimated Tax</span>
                    <span className="text-paper">
                      {formatMoney(tax, currency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <span className="font-display text-2xl uppercase">Total</span>
                  <span className="font-display text-3xl font-bold text-accent">
                    {formatMoney(total, currency)}
                  </span>
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
                    Free shipping over ₹5,000. Taxes calculated at checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 border-l-4 border-accent pl-4 font-display text-2xl font-semibold uppercase tracking-tight">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {suggestions.map((p) => (
                <div key={p._id} className="group">
                  <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-field">
                    <Link to={`/product/${p._id}`}>
                      <img
                        src={p.images?.[0]?.url || '/placeholder.jpg'}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({ productId: p._id, quantity: 1 })
                        }
                        className="rounded-[4px] bg-accent px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-ink transition-transform hover:scale-105"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                  <p className="mb-1 font-display text-[10px] uppercase tracking-wide text-muted">
                    {p.category || 'Apparel'}
                  </p>
                  <Link
                    to={`/product/${p._id}`}
                    className="font-display text-sm font-bold uppercase tracking-tight text-paper transition-colors hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-1 font-display text-sm text-accent">
                    {formatMoney(p.price?.amount, p.price?.currency)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full border-t border-line bg-surface py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="font-display text-2xl font-bold uppercase tracking-tight text-paper">
            STITCH
          </div>
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
