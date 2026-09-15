import { useState } from 'react';
import { useAccount } from '../hook/useAccount.js';
import {
  cardCls,
  cardTitleCls,
  labelCls,
  inputCls,
  primaryBtnCls,
  feedbackCls,
} from './styles.js';

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

const PasswordForm = () => {
  const { handleChangePassword } = useAccount();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setSaving(true);
    const result = await handleChangePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    setSaving(false);
    if (result.success) {
      setForm(emptyForm);
      setFeedback({ type: 'success', message: result.message });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
  };

  return (
    <section className={cardCls}>
      <h2 className={cardTitleCls}>Password</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password-current" className={labelCls}>
            Current Password
          </label>
          <input
            id="password-current"
            name="currentPassword"
            type="password"
            placeholder="Leave blank if you signed up with Google"
            className={inputCls}
            value={form.currentPassword}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password-new" className={labelCls}>
              New Password
            </label>
            <input
              id="password-new"
              name="newPassword"
              type="password"
              required
              minLength={6}
              className={inputCls}
              value={form.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password-confirm" className={labelCls}>
              Confirm Password
            </label>
            <input
              id="password-confirm"
              name="confirmPassword"
              type="password"
              required
              className={inputCls}
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className={primaryBtnCls}>
            {saving ? 'Saving...' : 'Update Password'}
          </button>
          {feedback && (
            <p className={feedbackCls[feedback.type]}>{feedback.message}</p>
          )}
        </div>
      </form>
    </section>
  );
};

export default PasswordForm;
