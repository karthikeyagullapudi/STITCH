import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import StatTile from '../components/StatTile.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import OrderStatusBadge from '../../orders/components/OrderStatusBadge.jsx';
import { useAdmin } from '../hook/useAdmin.js';
import { formatPrice } from '../../../shared/utils/format.js';

const ranges = [7, 30, 90];

const cardCls = 'border border-line bg-field p-6';
const cardTitleCls =
  'mb-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';

const Analytics = () => {
  const { handleGetAnalytics } = useAdmin();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    handleGetAnalytics(days).then((result) => {
      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const revenue = data?.revenueByDay.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const orders = data?.revenueByDay.reduce((sum, d) => sum + d.orders, 0) || 0;

  return (
    <AdminLayout active="Analytics">
      <div className="p-8 lg:p-10">
        <header className="mb-8">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Analytics
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            Paid orders only — refunded orders are excluded from revenue
          </p>
        </header>

        {/* Date range — scopes everything below */}
        <div className="mb-8 flex gap-2">
          {ranges.map((range) => (
            <button
              key={range}
              type="button"
              aria-pressed={days === range}
              onClick={() => setDays(range)}
              className={`border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                days === range
                  ? 'border-accent text-accent'
                  : 'border-line text-muted hover:border-paper hover:text-paper'
              }`}
            >
              Last {range} days
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {!data && !error && (
          <p className={cardTitleCls}>Loading analytics...</p>
        )}

        {data && (
          // While a new range loads, keep the previous render at reduced opacity.
          <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatTile label="Revenue" value={formatPrice(revenue)} accent />
              <StatTile label="Orders" value={orders.toLocaleString('en-IN')} />
              <StatTile
                label="Average Order"
                value={formatPrice(orders ? revenue / orders : 0)}
              />
            </div>

            <section className={`${cardCls} mb-6`}>
              <h2 className={cardTitleCls}>Revenue per day</h2>
              <RevenueChart data={data.revenueByDay} />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className={cardCls}>
                <h2 className={cardTitleCls}>Orders by status</h2>
                {data.ordersByStatus.length === 0 ? (
                  <p className="text-sm text-muted">No orders in this range.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-line">
                      {data.ordersByStatus.map(({ status, count }) => (
                        <tr key={status}>
                          <td className="py-3">
                            <OrderStatusBadge status={status} />
                          </td>
                          <td className="py-3 text-right tabular-nums text-paper">
                            {count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className={cardCls}>
                <h2 className={cardTitleCls}>Top products by revenue</h2>
                {data.topProducts.length === 0 ? (
                  <p className="text-sm text-muted">No sales in this range.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="font-display text-[11px] uppercase tracking-wider text-muted">
                      <tr>
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-right">Units</th>
                        <th className="pb-2 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line tabular-nums">
                      {data.topProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="py-3 text-paper">{product.title}</td>
                          <td className="py-3 text-right text-muted">
                            {product.quantity}
                          </td>
                          <td className="py-3 text-right text-paper">
                            {formatPrice(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics;
