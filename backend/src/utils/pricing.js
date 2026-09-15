/* Pure pricing rules shared by checkout — no database or config access. */

const round = (value) => Math.round(value * 100) / 100;

// Why a coupon can't be used on this subtotal, or null when it applies.
export const getCouponError = (coupon, subtotal, now = new Date()) => {
  if (!coupon || !coupon.active) return 'This promo code is not valid';
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return 'This promo code has expired';
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return 'This promo code has reached its usage limit';
  }
  if (subtotal < coupon.minOrderAmount) {
    return `Spend ₹${coupon.minOrderAmount} or more to use this code`;
  }
  return null;
};

export const getCouponDiscount = (coupon, subtotal) => {
  const discount =
    coupon.type === 'percentage'
      ? (subtotal * coupon.value) / 100
      : coupon.value;
  const capped =
    coupon.maxDiscount != null ? Math.min(discount, coupon.maxDiscount) : discount;
  return round(Math.min(capped, subtotal));
};

/**
 * @param lines    [{ unitPrice, quantity, taxable }]
 * @param settings { taxRate, shippingFee, freeShippingThreshold }
 * @param coupon   optional, already validated with getCouponError
 */
export const calculatePricing = (lines, settings, coupon) => {
  const sum = (items) =>
    items.reduce((total, line) => total + line.unitPrice * line.quantity, 0);

  const subtotal = round(sum(lines));
  const discount = coupon ? getCouponDiscount(coupon, subtotal) : 0;
  // Discounts are spread across items, so tax is charged on what's paid.
  const paidRatio = subtotal > 0 ? (subtotal - discount) / subtotal : 0;
  const tax = round(
    sum(lines.filter((line) => line.taxable)) *
      paidRatio *
      (settings.taxRate / 100),
  );
  const shipping =
    subtotal - discount >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: round(subtotal - discount + tax + shipping),
  };
};
