import React, { useState, useEffect } from 'react';
import { FiDroplet, FiWind, FiShield } from 'react-icons/fi';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const tabs = ['Technical Features', 'Materials', 'Shipping'];

const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
const formatPrice = (price) => {
  if (!price) return '';
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
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorway, setSelectedColorway] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
      if (product.colorways && product.colorways.length > 0) {
        setSelectedColorway(product.colorways[0]);
      } else {
        setSelectedColorway(null);
      }
      setQuantity(1);
      setActiveTab(0);
    }
  }, [product]);

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <p className={`${labelCaps} mb-2 text-accent`}>
          {product.category || 'Apparel'}
        </p>
        <h1 className="mb-2 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {product.title}
        </h1>
        <p className="font-display text-2xl font-semibold text-accent">
          {formatPrice(product.price)}
        </p>
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
        {product.sizes && product.sizes.length > 0 && (
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
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
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

        {/* Colorways */}
        {product.colorways && product.colorways.length > 0 && (
          <div>
            <label className={`${labelCaps} mb-2 block text-paper`}>
              Select Color: {selectedColorway?.name}
            </label>
            <div className="flex gap-3">
              {product.colorways.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColorway(c)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-8 w-8 rounded-full border-2 transition-all active:scale-95 ${
                    selectedColorway?.name === c.name
                      ? 'border-accent scale-110'
                      : 'border-line hover:border-accent'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
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
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent"
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
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-full w-10 items-center justify-center text-lg text-paper transition-colors hover:text-accent"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            className={`${labelCaps} h-14 w-full bg-accent tracking-[0.15em] text-ink transition-all hover:brightness-110 active:scale-[0.98]`}
          >
            Add to Bag
          </button>
          <button
            type="button"
            className={`${labelCaps} h-14 w-full border border-paper tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink active:scale-[0.98]`}
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
