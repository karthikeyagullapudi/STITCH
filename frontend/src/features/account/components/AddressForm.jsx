import { useState } from 'react';
import {
  labelCls,
  inputCls,
  primaryBtnCls,
  ghostBtnCls,
  feedbackCls,
} from './styles.js';

const fields = [
  { name: 'fullName', label: 'Full Name', required: true },
  { name: 'phone', label: 'Phone Number', required: true, type: 'tel' },
  { name: 'line1', label: 'Address Line 1', required: true, wide: true },
  { name: 'line2', label: 'Address Line 2', wide: true },
  { name: 'city', label: 'City', required: true },
  { name: 'state', label: 'State', required: true },
  { name: 'postalCode', label: 'Postal Code', required: true },
  { name: 'country', label: 'Country' },
];

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

/* `onSubmit` receives the address payload and resolves to a hook result. */
const AddressForm = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [form, setForm] = useState({ ...emptyAddress, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { _id, ...payload } = form;
    const result = await onSubmit(payload);
    setSaving(false);
    if (!result.success) setError(result.error);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, required, type = 'text', wide }) => (
          <div key={name} className={wide ? 'sm:col-span-2' : ''}>
            <label htmlFor={`address-${name}`} className={labelCls}>
              {label}
            </label>
            <input
              id={`address-${name}`}
              name={name}
              type={type}
              required={required}
              className={inputCls}
              value={form[name] || ''}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
      <label className="flex cursor-pointer items-center gap-2 select-none">
        <input
          type="checkbox"
          name="isDefault"
          className="stitch-checkbox"
          checked={form.isDefault}
          onChange={handleChange}
        />
        <span className="text-xs uppercase tracking-wide text-muted">
          Use as default address
        </span>
      </label>
      {error && <p className={feedbackCls.error}>{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtnCls}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={ghostBtnCls}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
