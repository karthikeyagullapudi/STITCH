import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AdminLayout from '../components/AdminLayout.jsx';
import StatTile from '../components/StatTile.jsx';
import OrderStatusBadge from '../../orders/components/OrderStatusBadge.jsx';
import { useAdmin } from '../hook/useAdmin.js';
import {
  formatPrice,
  formatDate,
  formatOrderNumber,
} from '../../../shared/utils/format.js';

const cardCls = 'border border-line bg-field';
const cardHeaderCls =
  'flex items-center justify-between border-b border-line px-6 py-4';
const cardTitleCls =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const linkCls =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em] text-accent hover:underline';

const Dashboard = () => {
  const { handleGetDashboard } = useAdmin();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleGetDashboard().then((result) =>
      result.success ? setData(result) : setError(result.error),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout active="Dashboard">
      <div className="p-8 lg:p-10">
        <header className="mb-10">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Dashboard
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            Store performance over the last 30 days
          </p>
        </header>

        {error && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {!data && !error && (
          <p className={`${cardTitleCls}`}>Loading dashboard...</p>
        )}

        {data && (
          <>
            <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
              <StatTile
                label="Revenue"
                value={formatPrice(data.stats.revenue)}
                note="Paid orders, last 30 days"
                accent
              />
              <StatTile
                label="Orders"
                value={data.stats.orders.toLocaleString('en-IN')}
                note="Paid, last 30 days"
              />
              <StatTile
                label="Customers"
                value={data.stats.customers.toLocaleString('en-IN')}
                note="All time"
              />
              <StatTile
                label="Active Products"
                value={data.stats.activeProducts.toLocaleString('en-IN')}
                note="Live in the storefront"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <section className={`${cardCls} xl:col-span-2`}>
                <div className={cardHeaderCls}>
                  <h2 className={cardTitleCls}>Recent Orders</h2>
                  <Link to="/admin/orders" className={linkCls}>
                    View all
                  </Link>
                </div>
                {data.recentOrders.length === 0 ? (
                  <p className="p-6 text-sm text-muted">No orders yet.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-line">
                      {data.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4">
                            <p className="font-display font-semibold uppercase text-paper">
                              {formatOrderNumber(order._id)}
                            </p>
                            <p className="text-xs text-muted">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-muted">
                            {order.user?.name?.firstName}{' '}
                            {order.user?.name?.lastName}
                          </td>
                          <td className="px-6 py-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 text-right font-display text-paper">
                            {formatPrice(
                              order.pricing.total,
                              order.pricing.currency,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className={cardCls}>
                <div className={cardHeaderCls}>
                  <h2 className={cardTitleCls}>Low Stock</h2>
                  <Link to="/admin/products" className={linkCls}>
                    Products
                  </Link>
                </div>
                {data.lowStock.length === 0 ? (
                  <p className="p-6 text-sm text-muted">
                    Everything is well stocked.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.lowStock.map((product) => (
                      <li key={product._id}>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-panel"
                        >
                          <img
                            src={product.images?.[0]?.url || '/placeholder.jpg'}
                            alt=""
                            className="h-12 w-10 object-cover"
                          />
                          <span className="flex-1 truncate text-sm text-paper">
                            {product.title}
                          </span>
                          <span
                            className={`font-display text-xs uppercase ${
                              product.stock <= 0 ? 'text-red-400' : 'text-accent'
                            }`}
                          >
                            {product.stock} left
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
