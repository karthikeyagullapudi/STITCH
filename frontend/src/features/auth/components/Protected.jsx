import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

const Protected = ({ children, role = 'user' }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-body text-paper">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Login sends the user back here once they've signed in.
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (role === 'user' && user.role !== 'user' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default Protected;
