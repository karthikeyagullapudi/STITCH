import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { FiCheckCircle } from 'react-icons/fi';
import Header from '../../../products/components/Header.jsx';
import Footer from '../../../../shared/components/Footer.jsx';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import PriceBreakdown from '../../components/PriceBreakdown.jsx';
import { AddressLines } from '../../../account/components/AddressBook.jsx';
import { useOrder } from '../../hook/useOrder.js';
import {
  formatPrice,
  formatDate,
  formatOrderNumber,
} from '../../../../shared/utils/format.js';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';
const sectionCls = 'border border-line bg-field p-6';
const steps = ['processing', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { orderId } = useParams();
  // Checkout navigates here with `placed` right after a successful payment.
  const placed = useLocation().state?.placed;
  const { handleGetOrderById, handleCancelOrder } = useOrder();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    handleGetOrderById(orderId).then((result) =>
      result.success ? setOrder(result.order) : setError(result.error),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const onCancel = async () => {
    if (!window.confirm('Cancel this order? You will be refunded in full.')) {
      return;
    }
    setCancelling(true);
    const result = await handleCancelOrder(order._id);
    setCancelling(false);
    if (result.success) setOrder(result.order);
    else setError(result.error);
  };

  const currentStep = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="flex min-h-screen flex-col bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto w-full flex-1 max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        {placed && (
          <div className="mb-8 flex items-center gap-4 border border-emerald-500/30 bg-emerald-500/10 p-6">
            <FiCheckCircle className="h-8 w-8 shrink-0 text-emerald-400" />
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                Order confirmed
              </h2>
              <p className="text-sm text-muted">
                Thank you — your payment went through and we&apos;re preparing
                your order.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-red-400">
            {error}
          </p>
        )}

        {!order && !error && (
          <p className={`${labelCaps} text-muted`}>Loading order...</p>
        )}

        {order && (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                  <Link to="/orders" className="hover:text-paper">
                    My Orders
                  </Link>{' '}
                  / {formatOrderNumber(order._id)}
                </p>
                <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
                  Order {formatOrderNumber(order._id)}
                </h1>
                <p className="mt-2 font-display text-[11px] uppercase tracking-wide text-muted">
                  Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                {order.status === 'processing' && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={cancelling}
                    className={`${labelCaps} border border-line px-4 py-2 text-muted transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-50`}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            {order.status !== 'cancelled' && (
              <div className="mb-8 grid grid-cols-3 gap-2">
                {steps.map((step, index) => (
                  <div key={step}>
                    <div
                      className={`mb-2 h-1 ${
                        index <= currentStep ? 'bg-accent' : 'bg-line'
                      }`}
                    />
                    <span
                      className={`${labelCaps} ${
                        index <= currentStep ? 'text-paper' : 'text-faint'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-6 lg:flex-row">
              <section className={`${sectionCls} w-full lg:w-[65%]`}>
                <h2 className={`${labelCaps} mb-5 text-muted`}>
                  Items ({order.items.length})
                </h2>
                <div className="divide-y divide-line">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 py-4">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.title}
                        className="h-24 w-20 object-cover"
                      />
                      <div className="flex flex-1 justify-between gap-4">
                        <div>
                          <Link
                            to={`/product/${item.slug || item.product}`}
                            className="font-display text-lg font-semibold uppercase transition-colors hover:text-accent"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 font-display text-[11px] uppercase tracking-wide text-muted">
                            {[item.size, item.colorway?.name, `Qty ${item.quantity}`]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <p className="font-display text-paper">
                          {formatPrice(
                            item.price.amount * item.quantity,
                            item.price.currency,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full space-y-6 lg:w-[35%]">
                <section className={sectionCls}>
                  <h2 className={`${labelCaps} mb-4 text-muted`}>
                    Shipping To
                  </h2>
                  <AddressLines address={order.shippingAddress} />
                </section>

                <section className={sectionCls}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className={`${labelCaps} text-muted`}>Payment</h2>
                    <OrderStatusBadge status={order.payment.status} />
                  </div>
                  <PriceBreakdown
                    pricing={order.pricing}
                    couponCode={order.coupon?.code}
                  />
                  {order.payment.status === 'refunded' && (
                    <p className="mt-4 font-display text-[11px] uppercase tracking-wide text-muted">
                      Refunded to your original payment method.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;
