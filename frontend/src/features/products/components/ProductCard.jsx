import React from 'react';
import { useNavigate } from 'react-router';
import WishlistButton from '../../wishlist/components/WishlistButton.jsx';
import { formatPrice } from '../../../shared/utils/format.js';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate(`/product/${product.slug || product._id}`);
      }}
      className="group flex flex-col border border-transparent bg-panel transition-colors hover:border-accent cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-field">
        <img
          src={product.images?.[0]?.url || '/placeholder.jpg'}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <WishlistButton
          productId={product._id}
          className="absolute left-3 top-3"
        />
        {product.collectionName && (
          <span className="absolute right-3 top-3 bg-accent px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-ink">
            {product.collectionName}
          </span>
        )}
      </div>
      <div className="bg-field p-4">
        <p className={`${labelCaps} mb-1 text-[10px] text-muted`}>
          {product.category || 'Apparel'}
        </p>
        <h3 className="mb-2 font-display text-lg font-semibold uppercase tracking-tight text-paper truncate">
          {product.title}
        </h3>
        <p className="flex items-baseline gap-2 font-display text-sm text-accent">
          {formatPrice(product.price?.amount, product.price?.currency)}
          {product.compareAtPrice > product.price?.amount && (
            <span className="text-xs text-faint line-through">
              {formatPrice(product.compareAtPrice, product.price?.currency)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
