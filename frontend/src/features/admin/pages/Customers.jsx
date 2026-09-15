import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout.jsx';
import Pagination from '../../../shared/components/Pagination.jsx';
import { useAdmin } from '../hook/useAdmin.js';
import { formatPrice, formatDate } from '../../../shared/utils/format.js';

const thCls =
  'p-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';

const Customers = () => {
  const { handleGetCustomers, handleUpdateCustomerStatus } = useAdmin();
  const { customers, customersMeta, loading, errors } = useSelector(
    (state) => state.admin,
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState(null);

  // Debounced so typing in the search box doesn't fire a request per key.
  useEffect(() => {
    const timer = setTimeout(() => handleGetCustomers({ search, page }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const toggleBlocked = async (customer) => {
    const blocking = customer.status;
    if (
      blocking &&
      !window.confirm(
        `Block ${customer.email}? They will be signed out and unable to log in.`,
      )
    ) {
      return;
    }
    const result = await handleUpdateCustomerStatus(customer._id, !blocking);
    setActionError(result.success ? null : result.error);
  };

  return (
    <AdminLayout active="Customers">
      <div className="p-8 lg:p-10">
        <header className="mb-10">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Customers
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            {customersMeta.total} registered customers
          </p>
        </header>

        <div className="relative mb-4 w-full sm:w-80">
          <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email or phone..."
            className="w-full border border-line bg-field py-3 pl-11 pr-4 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
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
                <th className={thCls}>Customer</th>
                <th className={thCls}>Phone</th>
                <th className={thCls}>Joined</th>
                <th className={`${thCls} text-right`}>Orders</th>
                <th className={`${thCls} text-right`}>Total Spent</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted"
                  >
                    {loading ? 'Loading customers...' : 'No customers found.'}
                  </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-line last:border-0"
                >
                  <td className="p-4">
                    <p className="text-sm text-paper">
                      {customer.name?.firstName} {customer.name?.lastName}
                    </p>
                    <p className="text-xs text-muted">
                      {customer.email}
                      {!customer.emailVerification && ' · unverified'}
                    </p>
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {customer.phone || '—'}
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="p-4 text-right text-sm tabular-nums text-paper">
                    {customer.orders}
                  </td>
                  <td className="p-4 text-right text-sm tabular-nums text-paper">
                    {formatPrice(customer.totalSpent)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${
                        customer.status
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {customer.status ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleBlocked(customer)}
                      className={`font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                        customer.status
                          ? 'text-muted hover:text-red-400'
                          : 'text-accent hover:brightness-110'
                      }`}
                    >
                      {customer.status ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-8 flex justify-end">
          <Pagination
            page={customersMeta.page}
            pages={customersMeta.pages}
            onChange={setPage}
          />
        </footer>
      </div>
    </AdminLayout>
  );
};

export default Customers;
