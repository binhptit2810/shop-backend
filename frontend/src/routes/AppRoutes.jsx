import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Protection
import ProtectedRoute from '../components/ProtectedRoute';

// User Pages
import Home from '../pages/user/Home';
import ProductDetail from '../pages/user/ProductDetail';
import Cart from '../pages/user/Cart';
import Checkout from '../pages/user/Checkout';
import Orders from '../pages/user/Orders';
import Profile from '../pages/user/Profile';
import Wishlist from '../pages/user/Wishlist';
import Search from '../pages/user/Search';

// Common Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import UserManagement from '../pages/admin/UserManagement';
import RevenueManagement from '../pages/admin/RevenueManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Nhóm Route Khách Hàng (User Site) dùng chung UserLayout */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="search" element={<Search />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Khách hàng cần đăng nhập mới vào được các trang sau */}
        <Route 
          path="cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="wishlist" 
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 2. Nhóm Route Quản Trị (Admin Site) dùng chung AdminLayout và được bảo vệ */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="revenue" element={<RevenueManagement />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
