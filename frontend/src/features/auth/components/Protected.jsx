import React from 'react';
import { useSelector } from 'react-redux';

const Protected = ({ children, role = 'user' }) => {
  const { user, loading, error } = useSelector((state) => state.auth);

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default Protected;
