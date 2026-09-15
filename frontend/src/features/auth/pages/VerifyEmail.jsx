import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../hook/useAuth';
import AuthLayout, {
  successCls,
  errorCls,
  submitCls,
} from '../components/AuthLayout.jsx';

const VerifyEmail = () => {
  const { token } = useParams();
  const { handleVerifyEmail, loadUser } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const [result, setResult] = useState(null);
  // The token is single-use, so never send it twice (StrictMode re-runs effects).
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    handleVerifyEmail(token).then((outcome) => {
      setResult(outcome);
      if (outcome.success) loadUser();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout title="Verify Email">
      {!result && <p className="text-muted">Verifying your email...</p>}
      {result?.success && <div className={successCls}>{result.message}</div>}
      {result?.error && <div className={errorCls}>{result.error}</div>}

      {result && (
        <Link
          to={user ? '/account' : '/login'}
          className={`${submitCls} flex items-center justify-center`}
        >
          {user ? 'Go to Account' : 'Sign in'}
        </Link>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
