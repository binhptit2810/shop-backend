import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  MessageSquare,
  LogOut, 
  User as UserIcon,
  Store,
  Menu,
  X
} from 'lucide-react';
import { showToast } from '../../services/toast';

const SellerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await API.get('/messages/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    showToast('Đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Lớp phủ mờ nền khi mở sidebar trên di động */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* 1. Sidebar Left */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Store size={24} color="var(--primary)" />
            <span>Kênh Người Bán</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          <NavLink 
            to="/seller" 
            end
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink 
            to="/seller/products" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Quản lý sản phẩm</span>
          </NavLink>

          <NavLink 
            to="/seller/orders" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <ClipboardList size={18} />
            <span>Quản lý đơn hàng</span>
          </NavLink>

          <NavLink 
            to="/seller/messages" 
            className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={18} />
              <span>Tin nhắn cửa hàng</span>
            </div>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: 1
              }}>
                {unreadCount}
              </span>
            )}
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
            aria-label="Toggle navigation sidebar"
          >
            <Menu size={22} />
          </button>
          
          <div className="admin-topbar-user">
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserIcon size={16} color="var(--primary)" />
              {user?.username} (Người bán)
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

export default SellerLayout;
