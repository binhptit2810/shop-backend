import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const SellerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get('/messages/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/seller', label: 'Tổng quan', icon: '📊', end: true },
    { to: '/seller/products', label: 'Sản phẩm', icon: '📦' },
    { to: '/seller/orders', label: 'Đơn hàng', icon: '🛒' },
    { to: '/seller/messages', label: 'Tin nhắn', icon: '💬', badge: unreadCount },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '72px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e94560, #0f3460)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(233,69,96,0.4)',
          }}>🏪</div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Kênh người bán</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {user?.username}
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(233,69,96,0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
                color: isActive ? '#e94560' : 'rgba(255,255,255,0.7)',
              })}
            >
              <span style={{ fontSize: '20px', flexShrink: 0, width: '24px', textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
              )}
              {sidebarOpen && item.badge > 0 && (
                <span style={{
                  background: '#e94560',
                  color: '#fff',
                  borderRadius: '20px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>{item.badge}</span>
              )}
              {!sidebarOpen && item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: '#e94560',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px', width: '100%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center' }}>🛍️</span>
            {sidebarOpen && <span>Về trang chính</span>}
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px', width: '100%',
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
              cursor: 'pointer', color: '#e94560', fontSize: '14px',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center' }}>🚪</span>
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute', top: '24px', right: '-12px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#e94560', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: '12px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen ? '240px' : '64px',
        transition: 'margin-left 0.3s ease',
        flex: 1,
        minHeight: '100vh',
        padding: '24px',
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>Kênh người bán</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#888', marginTop: '2px' }}>
              Quản lý cửa hàng của bạn
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e94560, #0f3460)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '14px',
            }}>
              {user?.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{user?.username}</div>
              <div style={{ fontSize: '11px', color: '#e94560', fontWeight: 500 }}>Người bán</div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
