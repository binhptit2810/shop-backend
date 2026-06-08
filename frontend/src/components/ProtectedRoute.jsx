import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading, isAdmin, isSeller } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (sellerOnly && !isSeller()) {
    // Nếu là admin, cho phép vào trang Seller để hỗ trợ
    if (isAdmin()) {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
