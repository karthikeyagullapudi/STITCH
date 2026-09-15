import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AdminLayout from '../components/AdminLayout.jsx';
import { useAdmin } from '../hook/useAdmin.js';
import { useSettings } from '../../settings/hook/useSettings.js';
import { formatDate } from '../../../shared/utils/format.js';

const cardCls = 'border border-line bg-field p-6';
const cardTitleCls =
  'mb-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper';
const labelCls =
  'mb-2 block font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
const inputCls =
  'w-full border border-line bg-panel px-4 py-3 text-sm text-paper outline-none transition-colors focus:border-accent';

const pricingFields = [
  ['taxRate', 'Tax Rate (%)', 'Applied to products with "Charge tax" on', { max: 100, step: '0.01' }],
  ['shippingFee', 'Shipping Fee (INR)', 'Charged below the free-shipping threshold', { step: '0.01' }],
  ['freeShippingThreshold', 'Free Shipping Over (INR)', 'Order value after discounts', { step: '0.01' }],
];

const Settings = () => {
  const { handleGetSettings, handleUpdateSettings } = useSettings();
  const { handleGetAdmins, handleUpdateAdminApproval } = useAdmin();
  const { admins, errors } = useSelector((state) => state.admin);
  const currentUser = useSelector((state) => state.auth.user);
  const [form, setForm] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [teamError, setTeamError] = useState(null);

  useEffect(() => {
    handleGetSettings().then((result) =>
      result.success
        ? setForm(result.settings)
        : setFeedback({ type: 'error', message: result.error }),
    );
    handleGetAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await handleUpdateSettings({
      taxRate: Number(form.taxRate),
      shippingFee: Number(form.shippingFee),
      freeShippingThreshold: Number(form.freeShippingThreshold),
    });
    setSaving(false);
    setFeedback(
      result.success
        ? { type: 'success', message: result.message }
        : { type: 'error', message: result.error },
    );
  };

  const setApproval = async (admin, approved) => {
    if (
      !approved &&
      !window.confirm(`Revoke admin access for ${admin.email}?`)
    ) {
      return;
    }
    const result = await handleUpdateAdminApproval(admin._id, approved);
    setTeamError(result.success ? null : result.error);
  };

  return (
    <AdminLayout active="Settings">
      <div className="max-w-4xl p-8 lg:p-10">
        <header className="mb-10">
          <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
            Settings
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.1em] text-muted">
            Store pricing and admin team
          </p>
        </header>

        {/* Pricing */}
        <section className={`${cardCls} mb-6`}>
          <h2 className={cardTitleCls}>Tax & Shipping</h2>
          <p className="mb-6 text-sm text-muted">
            Used for every checkout total and shown on product pages.
          </p>
          {form ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {pricingFields.map(([name, label, hint, attrs]) => (
                  <div key={name}>
                    <label htmlFor={`settings-${name}`} className={labelCls}>
                      {label}
                    </label>
                    <input
                      id={`settings-${name}`}
                      type="number"
                      min="0"
                      required
                      {...attrs}
                      value={form[name]}
                      onChange={(e) =>
                        setForm({ ...form, [name]: e.target.value })
                      }
                      className={inputCls}
                    />
                    <p className="mt-1 text-[11px] text-faint">{hint}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-accent px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                {feedback && (
                  <p
                    className={`font-display text-[11px] uppercase tracking-wide ${
                      feedback.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">
              {feedback?.message || 'Loading settings...'}
            </p>
          )}
        </section>

        {/* Team */}
        <section className={cardCls}>
          <h2 className={cardTitleCls}>Admin Team</h2>
          <p className="mb-6 text-sm text-muted">
            New admin sign-ups can't access the dashboard until approved here.
          </p>
          {(errors || teamError) && (
            <p className="mb-4 text-sm text-red-400">{teamError || errors}</p>
          )}
          <ul className="divide-y divide-line border border-line">
            {admins.map((admin) => (
              <li
                key={admin._id}
                className="flex flex-wrap items-center justify-between gap-4 bg-panel px-4 py-3"
              >
                <div>
                  <p className="text-sm text-paper">
                    {admin.name?.firstName} {admin.name?.lastName}
                    {admin._id === currentUser?._id && (
                      <span className="text-muted"> (you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {admin.email} · joined {formatDate(admin.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-block border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${
                      admin.adminAproved
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {admin.adminAproved ? 'Approved' : 'Pending'}
                  </span>
                  {admin._id !== currentUser?._id && (
                    <button
                      type="button"
                      onClick={() => setApproval(admin, !admin.adminAproved)}
                      className={`font-display text-[11px] font-bold uppercase tracking-[0.12em] ${
                        admin.adminAproved
                          ? 'text-muted hover:text-red-400'
                          : 'text-accent hover:brightness-110'
                      }`}
                    >
                      {admin.adminAproved ? 'Revoke' : 'Approve'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Settings;
