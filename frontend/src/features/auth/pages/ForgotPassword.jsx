import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hook/useAuth';
import AuthLayout, {
  labelCls,
  inputCls,
  submitCls,
  successCls,
  errorCls,
  linkCls,
} from '../components/AuthLayout.jsx';

const ForgotPassword = () => {
  const { handleForgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(await handleForgotPassword(email));
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
    >
      {result?.success && <div className={successCls}>{result.message}</div>}
      {result?.error && <div className={errorCls}>{result.error}</div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="forgot-email" className={labelCls}>
            Identity / Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            placeholder="user@stitch-tech.jp"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className={submitCls}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-8 text-center text-muted">
        Remembered it?
        <Link to="/login" className={linkCls}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
