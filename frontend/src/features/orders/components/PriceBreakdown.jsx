import { formatPrice } from '../../../shared/utils/format.js';

const rowCls = 'flex justify-between text-base';

const PriceBreakdown = ({ pricing, couponCode }) => {
  const { subtotal, discount, tax, shipping, total, currency } = pricing;

  return (
    <div>
      <div className="space-y-2 py-2">
        <div className={rowCls}>
          <span className="uppercase text-muted">Subtotal</span>
          <span className="text-paper">{formatPrice(subtotal, currency)}</span>
        </div>
        {discount > 0 && (
          <div className={rowCls}>
            <span className="uppercase text-muted">
              Discount{couponCode && ` (${couponCode})`}
            </span>
            <span className="text-emerald-400">
              −{formatPrice(discount, currency)}
            </span>
          </div>
        )}
        <div className={rowCls}>
          <span className="uppercase text-muted">Tax</span>
          <span className="text-paper">{formatPrice(tax, currency)}</span>
        </div>
        <div className={rowCls}>
          <span className="uppercase text-muted">Shipping</span>
          {shipping === 0 ? (
            <span className="font-bold uppercase text-accent">Free</span>
          ) : (
            <span className="text-paper">{formatPrice(shipping, currency)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="font-display text-2xl uppercase">Total</span>
        <span className="font-display text-3xl font-bold text-accent">
          {formatPrice(total, currency)}
        </span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
