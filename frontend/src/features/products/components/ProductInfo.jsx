import React, { useState, useEffect, useMemo } from 'react';
import { FiDroplet, FiWind, FiShield } from 'react-icons/fi';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const tabs = ['Technical Features', 'Materials', 'Shipping'];

/* Canonical size ordering so derived sizes render XS → XXL, not insertion order. */
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
const formatPrice = (price) => {
  if (!price || price.amount == null) return '';
  const symbol = currencySymbols[price.currency] || '₹';
  return `${symbol}${price.amount}`;
};

const getSpecIcon = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('water') || t.includes('rain')) return FiDroplet;
  if (t.includes('breath') || t.includes('wind')) return FiWind;
  return FiShield;
};

const ProductInfo = ({ product }) => {
  const variants = useMemo(() => product.variants || [], [product.variants]);
  const hasVariants = variants.length > 0;

  /* Distinct sizes present across the variant matrix, in canonical order. */
  const sizes = useMemo(() => {
    const present = new Set(variants.map((v) => v.size).filter(Boolean));
    return SIZE_ORDER.filter((s) => present.has(s));
  }, [variants]);

  /* Distinct colorways — sourced from variants, falling back to the
     top-level product.colorways list when variants carry no colour. */
  const colorways = useMemo(() => {
    const byName = new Map();
    variants.forEach((v) => {
      if (v.colorway?.name && !byName.has(v.colorway.name)) {
        byName.set(v.colorway.name, v.colorway);
      }
    });
    if (byName.size === 0 && product.colorways) {
      product.colorways.forEach((c) => byName.set(c.name, c));
    }
    return [...byName.values()];
  }, [variants, product.colorways]);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorway, setSelectedColorway] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  /* Locate the variant matching the current size/colour selection.
     Dimensions that don't exist on the product are treated as wildcards. */
  const matchVariant = (size, colorwayName) =>
    variants.find(
      (v) =>
        (!size || v.size === size) &&
        (!colorwayName || v.colorway?.name === colorwayName),
    );

  const selectedVariant = hasVariants
    ? matchVariant(
        sizes.length ? selectedSize : null,
        colorways.length ? selectedColorway?.name : null,
      )
    : null;

  /* Available stock for a size given the currently selected colour (and
     vice-versa), so unavailable combinations can be disabled in the UI. */
  const stockForSize = (size) => {
    const matches = variants.filter(
      (v) =>
        v.size === size &&
        (!colorways.length ||
          !selectedColorway ||
          v.colorway?.name === selectedColorway.name),
    );
    return matches.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  const stockForColorway = (name) => {
    const matches = variants.filter(
      (v) =>
        v.colorway?.name === name &&
        (!sizes.length || !selectedSize || v.size === selectedSize),
    );
    return matches.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  /* Effective stock/price for the resolved selection, falling back to the
     product-level values when the product isn't variant-based. */
  const activeStock = selectedVariant
    ? selectedVariant.stock ?? 0
    : product.stock ?? 0;
  const activePrice =
    selectedVariant?.price?.amount != null
      ? selectedVariant.price
      : product.price;
  const activeSku = selectedVariant?.sku || product.sku;
  const isOutOfStock = activeStock <= 0;

  /* Reset selections whenever the product (or its derived options) changes. */
  useEffect(() => {
    if (!product) return;
    setSelectedSize(sizes[0] || '');
    setSelectedColorway(colorways[0] || null);
    setQuantity(1);
    setActiveTab(0);
  }, [product, sizes, colorways]);

  /* Never let the quantity exceed what's in stock for the selection. */
  useEffect(() => {
    setQuantity((q) => {
      if (activeStock <= 0) return 1;
      return Math.min(Math.max(1, q), activeStock);
    });
  }, [activeStock]);

  const stockLabel = () => {
    if (isOutOfStock) return { text: 'Out of Stock', tone: 'text-red-400' };
    if (activeStock <= 5)
      return {
        text: `Low Stock · ${activeStock} left`,
        tone: 'text-amber-400',
      };
    return { text: 'In Stock', tone: 'text-emerald-400' };
  };
  const stock = stockLabel();

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <p className={`${labelCaps} mb-2 text-accent`}>
          {product.category || 'Apparel'}
        </p>
        <h1 className="mb-2 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {product.title}
        </h1>
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="font-display text-2xl font-semibold text-accent">
            {formatPrice(activePrice)}
          </p>
          {product.compareAtPrice ? (
            <p className="font-display text-lg text-muted line-through">
              {formatPrice({
                amount: product.compareAtPrice,
                currency: activePrice?.currency,
              })}
            </p>
          ) : null}
        </div>
      </div>

      {/* Spec row */}
      <div className="mb-8 flex flex-wrap gap-6 border-y border-line py-4">
        {(product.tags && product.tags.length > 0 ? product.tags.slice(0, 3) : ['Waterproof', 'Breathable', 'Shield']).map((tag) => {
          const Icon = getSpecIcon(tag);
          return (
            <div key={tag} className="flex items-center gap-2 text-paper">
              <Icon className="h-4 w-4 text-muted" />
              <span className={`${labelCaps} text-[10px]`}>{tag}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-10 space-y-8">
        {/* Size */}
        {sizes.length > 0 && (
          <div>
            <div className="mb-2 flex items-end justify-between">
              <label className={`${labelCaps} text-paper`}>
                Select Size: {selectedSize}
              </label>
              <button
                type="button"
                className="font-display text-xs text-muted underline underline-offset-4 transition-colors hover:text-accent"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((s) => {
                const soldOut = stockForSize(s) <= 0;
                const isActive = s === selectedSize;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    disabled={soldOut}
                    className={`relative flex h-12 items-center justify-center font-display text-sm font-bold uppercase transition-all active:scale-95 ${
                      isActive
                        ? 'border border-accent bg-field text-accent'
                        : 'border border-line text-paper hover:border-accent'
                    } ${
                      soldOut
                        ? 'cursor-not-allowed overflow-hidden text-muted/50 hover:border-line'
                        : ''
                    }`}
                  >
                    {s}
                    {soldOut && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-full rotate-[-24deg] bg-line" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colorways */}
        {colorways.length > 0 && (
          <div>
            <label className={`${labelCaps} mb-2 block text-paper`}>
              Select Color: {selectedColorway?.name}
            </label>
            <div className="flex flex-wrap gap-3">
              {colorways.map((c) => {
                const soldOut = stockForColorway(c.name) <= 0;
                const isActive = selectedColorway?.name === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColorway(c)}
                    disabled={soldOut}
                    style={{ backgroundColor: c.hex }}
                    className={`relative h-8 w-8 rounded-full border-2 transition-all active:scale-95 ${
                      isActive
                        ? 'scale-110 border-accent'
                        : 'border-line hover:border-accent'
                    } ${soldOut ? 'cursor-not-allowed opacity-40' : ''}`}
                    title={soldOut ? `${c.name} — Sold out` : c.name}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Selection summary: live stock + SKU for the resolved variant */}
        {(hasVariants || activeSku) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line/60 py-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOutOfStock
                    ? 'bg-red-400'
                    : activeStock <= 5
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                }`}
              />
              <span className={`${labelCaps} text-[10px] ${stock.tone}`}>
                {stock.text}
              </span>
            </div>
            {activeSku && (
              <span className="font-display text-[10px] uppercase tracking-[0.12em] text-faint">
                SKU · {activeSku}
              </span>
            )}
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className={`${labelCaps} mb-2 block text-paper`}>
            Quantity
          </label>
          <div className="flex h-12 w-32 items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock}
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-faint"
            >
              –
            </button>
            <input
              type="text"
              value={String(quantity).padStart(2, '0')}
              readOnly
              className="h-full w-12 border-none bg-transparent text-center font-display text-sm text-paper outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setQuantity((q) =>
                  activeStock > 0 ? Math.min(activeStock, q + 1) : q,
                )
              }
              disabled={isOutOfStock || quantity >= activeStock}
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-faint"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={isOutOfStock}
            className={`${labelCaps} h-14 w-full bg-accent tracking-[0.15em] text-ink transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted`}
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
          <button
            type="button"
            disabled={isOutOfStock}
            className={`${labelCaps} h-14 w-full border border-paper tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent`}
          >
            Buy it Now
          </button>
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
              <p>{product.description}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="bg-field px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 1 && (
            <p className="text-muted leading-relaxed text-sm">
              STITCH technical garments utilize high-tenacity polymers, breathable membranes, and robust seam tape to ensure longevity and weather protection in demanding environments.
            </p>
          )}
          {activeTab === 2 && (
            <p className="text-muted leading-relaxed text-sm">
              Free express shipping on all domestic orders over ₹5,000. Orders are dispatched within 24-48 hours and typically arrive within 3-5 business days.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
