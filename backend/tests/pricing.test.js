import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePricing,
  getCouponDiscount,
  getCouponError,
} from '../src/utils/pricing.js';

const settings = { taxRate: 18, shippingFee: 199, freeShippingThreshold: 5000 };

const lines = [
  { unitPrice: 1000, quantity: 2, taxable: true },
  { unitPrice: 500, quantity: 1, taxable: false },
];

const coupon = (overrides = {}) => ({
  type: 'percentage',
  value: 10,
  maxDiscount: null,
  minOrderAmount: 0,
  expiresAt: null,
  usageLimit: null,
  usedCount: 0,
  active: true,
  ...overrides,
});

test('taxes only taxable lines and charges shipping below the threshold', () => {
  assert.deepEqual(calculatePricing(lines, settings), {
    subtotal: 2500,
    discount: 0,
    tax: 360,
    shipping: 199,
    total: 3059,
  });
});

test('ships free once the discounted subtotal reaches the threshold', () => {
  const pricing = calculatePricing(
    [{ unitPrice: 5000, quantity: 1, taxable: false }],
    settings,
  );
  assert.equal(pricing.shipping, 0);
  assert.equal(pricing.total, 5000);
});

test('caps percentage discounts and taxes only what is paid', () => {
  const pricing = calculatePricing(lines, settings, coupon({ maxDiscount: 200 }));
  assert.equal(pricing.discount, 200);
  // 2000 taxable × (2300 / 2500 paid) × 18%
  assert.equal(pricing.tax, 331.2);
  assert.equal(pricing.total, 2830.2);
});

test('a fixed discount never exceeds the subtotal', () => {
  assert.equal(
    getCouponDiscount(coupon({ type: 'fixed', value: 99999 }), 2500),
    2500,
  );
});

test('explains why a coupon cannot be used', () => {
  assert.equal(getCouponError(null, 100), 'This promo code is not valid');
  assert.equal(
    getCouponError(coupon({ active: false }), 100),
    'This promo code is not valid',
  );
  assert.equal(
    getCouponError(coupon({ expiresAt: new Date('2020-01-01') }), 100),
    'This promo code has expired',
  );
  assert.equal(
    getCouponError(coupon({ usageLimit: 5, usedCount: 5 }), 100),
    'This promo code has reached its usage limit',
  );
  assert.equal(
    getCouponError(coupon({ minOrderAmount: 1000 }), 999),
    'Spend ₹1000 or more to use this code',
  );
  assert.equal(getCouponError(coupon(), 100), null);
});
