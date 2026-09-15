const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

// e.g. formatPrice(12450) → "₹12,450"
export const formatPrice = (amount, currency = 'INR') =>
  `${currencySymbols[currency] || '₹'}${Number(amount || 0).toLocaleString(
    'en-IN',
    { maximumFractionDigits: 2 },
  )}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// Short customer-facing order reference: the id's last 8 characters.
export const formatOrderNumber = (orderId) =>
  `#${String(orderId).slice(-8).toUpperCase()}`;
