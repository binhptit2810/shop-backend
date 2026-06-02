import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';

const UserLayout = () => {
  const { user, isAdmin } = useContext(AuthContext);

  // Nếu người dùng đăng nhập là ADMIN, chặn truy cập trang mua sắm và điều hướng về Dashboard Admin
  if (user && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
