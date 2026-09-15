import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import AdminLayout from '../../../admin/components/AdminLayout.jsx';
import OrderStatusBadge from '../../components/OrderStatusBadge.jsx';
import { AddressLines } from '../../../account/components/AddressBook.jsx';
import Pagination from '../../../../shared/components/Pagination.jsx';
import { useOrder } from '../../hook/useOrder.js';
import {
  formatPrice,
  formatDate,
  formatOrderNumber,
} from '../../../../shared/utils/format.js';

// Mirrors the transitions the API allows.
const NEXT_STATUS = {
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
};

const thCls =
  'p-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const selectCls =
  'appearance-none border border-line bg-field px-4 py-3 pr-10 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper outline-none transition-colors focus:border-accent';

const AdminOrders = () => {
  const { handleGetAllOrders, handleUpdateOrderStatus } = useOrder();
  const { adminOrders, adminMeta, loading, errors } = useSelector(
    (state) => state.order,
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Debounced so typing in the search box doesn't fire a request per key.
  useEffect(() => {
    const timer = setTimeout(
      () => handleGetAllOrders({ search, status, page }),
      300,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const changeStatus = async (order, next) => {
    if (
      next === 'cancelled' &&
      !window.confirm('Cancel this order and refund the customer in full?')
    ) {
      return;
    }
    const result = await handleUpdateOrderStatus(order._id, next);
    setActionError(result.success ? null : result.error);
  };

  return (
    <AdminLayout active="Orders">
      <div className="p-8 lg:p-10">
        <header className="mb-10">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Orders
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            {adminMeta.total} paid orders
          </p>
        </header>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order # or customer..."
              className="w-full border border-line bg-field py-3 pl-11 pr-4 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={`${selectCls} min-w-[180px]`}
            >
              <option value="">All Statuses</option>
              {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </div>

        {(errors || actionError) && (
          <p className="mb-4 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {actionError || errors}
          </p>
        )}

        <div className="overflow-x-auto border border-line bg-field">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th className={thCls}>Order</th>
                <th className={thCls}>Customer</th>
                <th className={thCls}>Items</th>
                <th className={thCls}>Total</th>
                <th className={thCls}>Payment</th>
                <th className={thCls}>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted"
                  >
                    {loading ? 'Loading orders...' : 'No orders found.'}
                  </td>
                </tr>
              )}
              {adminOrders.map((order) => (
                <Fragment key={order._id}>
                  <tr
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                    className="cursor-pointer border-b border-line transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <p className="font-display text-sm font-semibold uppercase text-paper">
                        {formatOrderNumber(order._id)}
                      </p>
                      <p className="font-display text-[10px] uppercase tracking-wide text-muted">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-paper">
                        {order.user?.name?.firstName} {order.user?.name?.lastName}
                      </p>
                      <p className="text-xs text-muted">{order.user?.email}</p>
                    </td>
                    <td className="p-4 font-display text-xs uppercase text-muted">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="p-4 font-display text-sm font-semibold text-paper">
                      {formatPrice(order.pricing.total, order.pricing.currency)}
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={order.payment.status} />
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        {NEXT_STATUS[order.status] && (
                          <select
                            value=""
                            onChange={(e) => changeStatus(order, e.target.value)}
                            className="border border-line bg-panel px-2 py-1 font-display text-[10px] uppercase tracking-wide text-paper outline-none focus:border-accent"
                          >
                            <option value="" disabled>
                              Update
                            </option>
                            {NEXT_STATUS[order.status].map((next) => (
                              <option key={next} value={next}>
                                Mark {next}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === order._id && (
                    <tr className="border-b border-line bg-panel">
                      <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <p key={index} className="text-sm text-paper">
                                {item.quantity} × {item.title}
                                <span className="text-muted">
                                  {[item.size, item.colorway?.name]
                                    .filter(Boolean)
                                    .map((detail) => ` · ${detail}`)}
                                </span>
                              </p>
                            ))}
                            {order.coupon?.code && (
                              <p className="text-xs uppercase text-muted">
                                Coupon {order.coupon.code}
                              </p>
                            )}
                          </div>
                          <AddressLines address={order.shippingAddress} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-8 flex justify-end">
          <Pagination
            page={adminMeta.page}
            pages={adminMeta.pages}
            onChange={setPage}
          />
        </footer>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
