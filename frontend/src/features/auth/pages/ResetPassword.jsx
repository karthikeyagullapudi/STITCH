import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '../hook/useAuth';
import AuthLayout, {
  labelCls,
  inputCls,
  submitCls,
  errorCls,
  linkCls,
} from '../components/AuthLayout.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { handleResetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await handleResetPassword(token, password);
    setLoading(false);
    if (result.success) {
      navigate('/login', { replace: true, state: { message: result.message } });
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="New Password"
      subtitle="Choose a new password for your STITCH account."
    >
      {error && <div className={errorCls}>{error}</div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="reset-password" className={labelCls}>
            New Password
          </label>
          <input
            id="reset-password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="reset-confirm" className={labelCls}>
            Confirm Password
          </label>
          <input
            id="reset-confirm"
            type="password"
            required
            placeholder="••••••••"
            className={inputCls}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className={submitCls}>
          {loading ? 'Saving...' : 'Update Password'}
        </button>
      </form>

      <p className="mt-8 text-center text-muted">
        Link expired?
        <Link to="/forgot-password" className={linkCls}>
          Request a new one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
