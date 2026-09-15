import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../products/components/AdminLayout.jsx';
import { useCoupon } from '../../hook/useCoupon.js';
import { formatPrice, formatDate } from '../../../../shared/utils/format.js';

const labelCls =
  'mb-2 block font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const inputCls =
  'w-full border border-line bg-panel px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent';
const thCls =
  'p-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  expiresAt: '',
  usageLimit: '',
};

const describeDiscount = (coupon) =>
  coupon.type === 'percentage'
    ? `${coupon.value}% off${coupon.maxDiscount != null ? ` (max ${formatPrice(coupon.maxDiscount)})` : ''}`
    : `${formatPrice(coupon.value)} off`;

const Coupons = () => {
  const {
    handleGetCoupons,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleDeleteCoupon,
  } = useCoupon();
  const { coupons, loading, errors } = useSelector((state) => state.coupon);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    handleGetCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Blank optional fields mean "no limit".
    const result = await handleCreateCoupon({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    });
    setSaving(false);
    if (result.success) setForm(emptyForm);
  };

  const onDelete = (coupon) => {
    if (window.confirm(`Delete coupon ${coupon.code}?`)) {
      handleDeleteCoupon(coupon._id);
    }
  };

  return (
    <AdminLayout active="Coupons">
      <div className="p-8 lg:p-10">
        <header className="mb-10">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Coupons
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            Promo codes customers can apply at checkout
          </p>
        </header>

        {errors && (
          <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errors}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-10 border border-line bg-field p-6"
        >
          <h2 className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            New Coupon
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>Code</label>
              <input
                name="code"
                required
                value={form.code}
                onChange={handleChange}
                placeholder="DROP10"
                className={`${inputCls} uppercase`}
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {form.type === 'percentage' ? 'Percent Off' : 'Amount Off (INR)'}
              </label>
              <input
                name="value"
                type="number"
                min="0"
                max={form.type === 'percentage' ? 100 : undefined}
                step="0.01"
                required
                value={form.value}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Min Order (INR)</label>
              <input
                name="minOrderAmount"
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="0"
                className={inputCls}
              />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className={labelCls}>Max Discount (INR)</label>
                <input
                  name="maxDiscount"
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="No cap"
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className={labelCls}>Expires</label>
              <input
                name="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                name="usageLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 bg-accent px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>

        <div className="overflow-x-auto border border-line bg-field">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th className={thCls}>Code</th>
                <th className={thCls}>Discount</th>
                <th className={thCls}>Min Order</th>
                <th className={thCls}>Used</th>
                <th className={thCls}>Expires</th>
                <th className={thCls}>Active</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center font-display text-xs uppercase tracking-[0.12em] text-muted"
                  >
                    {loading ? 'Loading coupons...' : 'No coupons yet.'}
                  </td>
                </tr>
              )}
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-line last:border-0">
                  <td className="p-4 font-display text-sm font-semibold uppercase text-paper">
                    {coupon.code}
                  </td>
                  <td className="p-4 text-sm text-paper">
                    {describeDiscount(coupon)}
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {formatPrice(coupon.minOrderAmount)}
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {coupon.usedCount}
                    {coupon.usageLimit != null && ` / ${coupon.usageLimit}`}
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                  </td>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="stitch-checkbox"
                      aria-label={`Toggle ${coupon.code}`}
                      checked={coupon.active}
                      onChange={() =>
                        handleUpdateCoupon(coupon._id, { active: !coupon.active })
                      }
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      aria-label={`Delete ${coupon.code}`}
                      onClick={() => onDelete(coupon)}
                      className="p-2 text-muted transition-colors hover:text-red-400"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Coupons;
