import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag as TagIcon, 
  ClipboardList, 
  Users, 
  TrendingUp, 
  LogOut, 
  User as UserIcon,
  Store,
  Menu,
  X
} from 'lucide-react';
import { showToast } from '../services/toast';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    showToast('Đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Lớp phủ mờ nền khi mở sidebar trên mobile */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* 1. Sidebar Left */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Store size={24} color="var(--primary)" />
            <span>Shop Admin</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan (KPIs)</span>
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Quản lý sản phẩm</span>
          </NavLink>

          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <TagIcon size={18} />
            <span>Quản lý danh mục</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <ClipboardList size={18} />
            <span>Quản lý đơn hàng</span>
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Users size={18} />
            <span>Quản lý thành viên</span>
          </NavLink>

          <NavLink 
            to="/admin/revenue" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <TrendingUp size={18} />
            <span>Doanh thu & Báo cáo</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content area on the right */}
      <div className="admin-main-viewport">
        {/* Topbar */}
        <header className="admin-topbar">
          <button 
            className="admin-menu-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle admin navigation sidebar"
          >
            <Menu size={22} />
          </button>
          
          <div className="admin-topbar-user">
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserIcon size={16} color="var(--primary)" />
              {user?.username} (Admin)
            </span>
          </div>
        </header>

        {/* Content wrapper */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
