import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  FiDroplet,
  FiWind,
  FiShield,
  FiCheck,
  FiPackage,
  FiTag,
  FiAlertCircle,
  FiShoppingBag,
} from 'react-icons/fi';
import { useCart } from '../../cart/hook/useCart.js';
import WishlistButton from '../../wishlist/components/WishlistButton.jsx';
import SizeGuide from './SizeGuide.jsx';
import { useSettings } from '../../settings/hook/useSettings.js';
import { formatPrice as formatAmount } from '../../../shared/utils/format.js';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const tabs = ['Technical Features', 'Materials', 'Shipping'];

// Shoppers only see the exact remaining count once stock drops below this.
const LOW_STOCK_THRESHOLD = 5;

const formatPrice = (price) =>
  price ? formatAmount(price.amount, price.currency) : '';

const getSpecIcon = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('water') || t.includes('rain')) return FiDroplet;
  if (t.includes('breath') || t.includes('wind')) return FiWind;
  return FiShield;
};

const ProductInfo = ({ product, selectedVariant, onSelectVariant }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [settings, setSettings] = useState(null);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { handleAddToCart } = useCart();
  const { handleGetSettings } = useSettings();

  // Shipping copy uses the store's live fee and free-shipping threshold.
  useEffect(() => {
    handleGetSettings().then((result) => {
      if (result.success) setSettings(result.settings);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Size/colour options come from the real variants, and the selected variant
  // is the single source of truth for both.
  const variants = product?.variants || [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colorways = [
    ...new Map(
      variants
        .filter((v) => v.colorway?.name)
        .map((v) => [v.colorway.name, v.colorway]),
    ).values(),
  ];
  const selectedSize = selectedVariant?.size;
  const selectedColorway = selectedVariant?.colorway;

  // Keep the other option when that combination exists, else take the first
  // variant offering the clicked option.
  const handleSelectSize = (size) =>
    onSelectVariant(
      variants.find(
        (v) => v.size === size && v.colorway?.name === selectedColorway?.name,
      ) || variants.find((v) => v.size === size),
    );

  const handleSelectColorway = (name) =>
    onSelectVariant(
      variants.find(
        (v) => v.colorway?.name === name && v.size === selectedSize,
      ) || variants.find((v) => v.colorway?.name === name),
    );

  const currentPrice = selectedVariant?.price
    ? formatPrice(selectedVariant.price)
    : formatPrice(product?.price);

  const currentAmount =
    selectedVariant?.price?.amount ?? product?.price?.amount;

  const currentSku = selectedVariant?.sku || product?.sku || 'STCH-MASTER';
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  // Products that don't track quantity can always be bought.
  const tracksStock = product?.trackQuantity !== false;
  const isOutOfStock = tracksStock && currentStock <= 0;
  const isLowStock =
    tracksStock && !isOutOfStock && currentStock < LOW_STOCK_THRESHOLD;
  // Never let the chosen quantity exceed what's left of this variant.
  const orderQuantity = tracksStock
    ? Math.max(1, Math.min(quantity, currentStock))
    : quantity;

  // Adds the current selection to the bag; resolves to null if nothing was sent.
  const addSelectionToBag = async () => {
    if (!product?._id || isOutOfStock || adding) return null;
    // The bag is per-user — send guests to log in first.
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return null;
    }
    setAdding(true);
    setFeedback(null);
    const result = await handleAddToCart({
      productId: product._id,
      variantId: selectedVariant?._id || null,
      size: selectedSize,
      colorway: selectedColorway || undefined,
      quantity: orderQuantity,
    });
    setAdding(false);
    if (!result.success) {
      setFeedback({
        type: 'error',
        message: result.error || 'Failed to add to bag',
      });
    }
    return result;
  };

  const handleAddToBag = async () => {
    const result = await addSelectionToBag();
    if (result?.success) {
      setFeedback({ type: 'success', message: 'Added to your bag' });
    }
  };

  const handleBuyNow = async () => {
    const result = await addSelectionToBag();
    if (result?.success) navigate('/checkout');
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <p className={`${labelCaps} mb-2 text-accent`}>
          {product?.category || 'Apparel'}
        </p>
        <h1 className="mb-2 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {product?.title}
        </h1>
        <div className="flex items-center gap-4">
          <p className="font-display text-3xl font-semibold text-accent">
            {currentPrice}
          </p>
          {product?.compareAtPrice > currentAmount && (
            <span className="font-display text-base text-muted line-through">
              {formatAmount(product.compareAtPrice, product.price?.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Selected Variant Data Summary Banner */}
      <div className="mb-8 border border-line bg-panel p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
          <div className="flex items-center gap-2">
            <FiPackage className="h-4 w-4 text-accent" />
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-paper">
              Variant Specifications
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider ${
              isOutOfStock
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : isLowStock
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {isOutOfStock ? (
              <>
                <FiAlertCircle className="h-3 w-3" />
                OUT OF STOCK
              </>
            ) : isLowStock ? (
              <>
                <FiAlertCircle className="h-3 w-3" />
                ONLY {currentStock} LEFT
              </>
            ) : (
              <>
                <FiCheck className="h-3 w-3" />
                IN STOCK
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 font-display text-[11px] sm:grid-cols-3">
          <div>
            <span className="block text-[10px] uppercase text-muted">SKU Code</span>
            <span className="font-bold text-paper tracking-wider">{currentSku}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-muted">Selected Size</span>
            <span className="font-bold text-accent">{selectedSize || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-muted">Selected Color</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {selectedColorway?.hex && (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-line"
                  style={{ backgroundColor: selectedColorway.hex }}
                />
              )}
              <span className="font-bold text-paper">
                {selectedColorway?.name || 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spec row */}
      {product?.tags?.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-6 border-y border-line py-4">
          {product.tags.slice(0, 3).map((tag) => {
            const Icon = getSpecIcon(tag);
            return (
              <div key={tag} className="flex items-center gap-2 text-paper">
                <Icon className="h-4 w-4 text-muted" />
                <span className={`${labelCaps} text-[10px]`}>{tag}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-10 space-y-8">
        {/* Size Selection UI */}
        {sizes.length > 0 && (
          <div>
            <div className="mb-2 flex items-end justify-between">
              <label className={`${labelCaps} text-paper`}>
                Select Size: <span className="text-accent">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="font-display text-xs text-muted underline underline-offset-4 transition-colors hover:text-accent"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectSize(s)}
                  className={`flex h-12 items-center justify-center font-display text-sm font-bold uppercase transition-all active:scale-95 ${
                    s === selectedSize
                      ? 'border border-accent bg-field text-accent'
                      : 'border border-line text-paper hover:border-accent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colorways Selection UI */}
        {colorways.length > 0 && (
          <div>
            <label className={`${labelCaps} mb-2 block text-paper`}>
              Select Color: <span className="text-accent">{selectedColorway?.name}</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {colorways.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectColorway(c.name)}
                  className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 transition-all active:scale-95 ${
                    selectedColorway?.name === c.name
                      ? 'border-accent bg-panel text-accent scale-105'
                      : 'border-line bg-field text-muted hover:border-accent hover:text-paper'
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Variants Matrix Design UI */}
        {variants.length > 0 && (
          <div className="border border-line bg-panel p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-display text-[11px] font-bold uppercase tracking-wider text-paper flex items-center gap-2">
                <FiTag className="h-3.5 w-3.5 text-accent" />
                Available Variants ({variants.length})
              </span>
              <span className="text-[10px] text-muted">Click variant to view info</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {variants.map((v, idx) => {
                const isSelected =
                  selectedVariant?._id === v._id || selectedVariant === v;
                const variantImg =
                  v.images?.[0]?.url || product?.images?.[0]?.url;
                const varStock = v.stock ?? 0;
                const isVarOut = varStock <= 0;
                const isVarLow = !isVarOut && varStock < LOW_STOCK_THRESHOLD;

                return (
                  <div
                    key={v._id || idx}
                    onClick={() => onSelectVariant(v)}
                    className={`group cursor-pointer border p-3 transition-all flex gap-3 items-center ${
                      isSelected
                        ? 'border-accent bg-field shadow-md'
                        : 'border-line/80 bg-panel hover:border-paper/40'
                    }`}
                  >
                    {/* Primary Image of the Variant */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-line bg-ink">
                      <img
                        src={variantImg || '/placeholder.jpg'}
                        alt={v.colorway?.name || v.size}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <span className="absolute bottom-0 inset-x-0 bg-accent text-[8px] font-bold uppercase text-ink text-center py-0.5">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Info of the Variant */}
                    <div className="flex-1 min-w-0 space-y-1 font-display text-[10px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="h-3 w-3 rounded-full border border-line shrink-0"
                            style={{
                              backgroundColor: v.colorway?.hex || '#000',
                            }}
                          />
                          <span className="font-bold uppercase text-paper truncate">
                            {v.colorway?.name || 'Default'}
                          </span>
                        </div>
                        <span className="border border-line bg-panel px-1.5 py-0.5 text-[9px] font-bold text-accent shrink-0">
                          {v.size}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-muted">
                        <span className="truncate">SKU: {v.sku || 'N/A'}</span>
                        <span className="font-bold text-accent shrink-0">
                          {v.price?.amount
                            ? formatPrice(v.price)
                            : formatPrice(product?.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px]">
                        <span
                          className={
                            isVarOut
                              ? 'text-red-400 font-bold'
                              : isVarLow
                              ? 'text-amber-400 font-bold'
                              : 'text-emerald-400 font-bold'
                          }
                        >
                          {isVarOut
                            ? 'OUT OF STOCK'
                            : isVarLow
                            ? `Only ${varStock} left`
                            : 'In Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div>
          <label className={`${labelCaps} mb-2 block text-paper`}>
            Quantity
          </label>
          <div className="flex h-12 w-32 items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, orderQuantity - 1))}
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent"
            >
              –
            </button>
            <input
              type="text"
              value={String(orderQuantity).padStart(2, '0')}
              readOnly
              className="h-full w-12 border-none bg-transparent text-center font-display text-sm text-paper outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(orderQuantity + 1)}
              disabled={tracksStock && orderQuantity >= currentStock}
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={adding || isOutOfStock}
            className={`${labelCaps} flex h-14 w-full items-center justify-center gap-2 bg-accent tracking-[0.15em] text-ink transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <FiShoppingBag className="h-4 w-4" />
            {isOutOfStock
              ? 'Out of Stock'
              : adding
              ? 'Adding...'
              : 'Add to Bag'}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={adding || isOutOfStock}
            className={`${labelCaps} h-14 w-full border border-paper tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Buy it Now
          </button>
          {/* Saves the size/colour the shopper has actually selected, so
              "Move to Bag" from the wishlist carries the choice through. */}
          <WishlistButton
            variant="full"
            productId={product?._id}
            variantId={selectedVariant?._id || null}
            size={selectedSize}
            colorway={selectedColorway || undefined}
          />
          {feedback && (
            <p
              className={`flex items-center gap-1.5 pt-1 font-display text-[11px] uppercase tracking-wide ${
                feedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <FiCheck className="h-3.5 w-3.5" />
              ) : (
                <FiAlertCircle className="h-3.5 w-3.5" />
              )}
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      {/* Info tabs */}
      <div className="border-t border-line">
        <div className="flex border-b border-line">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-4 text-center font-display text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
                i === activeTab
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted hover:text-paper'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="min-h-[160px] py-8">
          {activeTab === 0 && (
            <div className="text-muted leading-relaxed text-sm space-y-4">
              <p>{product?.description}</p>
              {product?.tags && product.tags.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-field px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-muted"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 1 && (
            <p className="whitespace-pre-line text-muted leading-relaxed text-sm">
              {product?.materials ||
                'No material details have been added for this product yet.'}
            </p>
          )}
          {activeTab === 2 && (
            <p className="text-muted leading-relaxed text-sm">
              {settings &&
                `Shipping is ${formatAmount(settings.shippingFee)}, or free on orders over ${formatAmount(settings.freeShippingThreshold)}. `}
              Orders are dispatched within 1–2 business days and usually
              arrive within 3–7 business days. Unshipped orders can be
              cancelled from My Orders for a full refund —{' '}
              <Link to="/pages/returns" className="text-accent hover:underline">
                returns policy
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </div>
  );
};

export default ProductInfo;


