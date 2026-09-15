import { useEffect } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { FiPackage } from 'react-icons/fi';
import Header from '../../../products/components/Header.jsx';
import Footer from '../../../../shared/components/Footer.jsx';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import { useOrder } from '../../hook/useOrder.js';
import {
  formatPrice,
  formatDate,
  formatOrderNumber,
} from '../../../../shared/utils/format.js';

const MyOrders = () => {
  const { handleGetMyOrders } = useOrder();
  const { orders, loading, errors } = useSelector((state) => state.order);

  useEffect(() => {
    handleGetMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-8">
          <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            <Link to="/account" className="hover:text-paper">
              Account
            </Link>{' '}
            / Orders
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
            My Orders
          </h1>
        </div>

        {errors && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-red-400">
            {errors}
          </p>
        )}

        {loading && orders.length === 0 && (
          <p className="font-display text-xs uppercase tracking-[0.12em] text-muted">
            Loading orders...
          </p>
        )}

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 border border-line bg-field py-24 text-center">
            <FiPackage className="h-10 w-10 text-muted" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              No orders yet
            </h2>
            <Link
              to="/"
              className="border border-paper px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink"
            >
              Start Shopping
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex flex-col gap-4 border border-line bg-field p-5 transition-colors hover:border-accent md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.image || '/placeholder.jpg'}
                      alt={item.title}
                      className="h-16 w-12 border border-line object-cover"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold uppercase">
                    {formatOrderNumber(order._id)}
                  </p>
                  <p className="font-display text-[11px] uppercase tracking-wide text-muted">
                    {formatDate(order.createdAt)} · {order.items.length}{' '}
                    {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <OrderStatusBadge status={order.status} />
                <span className="font-display text-xl text-accent">
                  {formatPrice(order.pricing.total, order.pricing.currency)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
