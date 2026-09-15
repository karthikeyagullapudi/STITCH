const styles = {
  pending: 'border-line bg-line/40 text-muted',
  processing: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  shipped: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  cancelled: 'border-red-500/30 bg-red-500/10 text-red-400',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  failed: 'border-red-500/30 bg-red-500/10 text-red-400',
  refunded: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

// Works for both order statuses and payment statuses.
const OrderStatusBadge = ({ status }) => (
  <span
    className={`inline-block border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${
      styles[status] || styles.pending
    }`}
  >
    {status}
  </span>
);

export default OrderStatusBadge;
