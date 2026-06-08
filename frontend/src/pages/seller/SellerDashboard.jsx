import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      borderLeft: `4px solid ${color}`,
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; } }}
  >
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: color, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>{label}</div>
  </div>
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, unread: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, unreadRes] = await Promise.all([
          API.get('/products/my-products'),
          API.get('/orders/seller'),
          API.get('/messages/unread-count'),
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const revenue = orders
          .filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED')
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
          unread: unreadRes.data?.count || 0,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusConfig = {
    PENDING: { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' },
    SHIPPING: { label: 'Đang giao', color: '#8b5cf6', bg: '#ede9fe' },
    DELIVERED: { label: 'Đã giao', color: '#10b981', bg: '#d1fae5' },
    COMPLETED: { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#888' }}>Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>Tổng quan cửa hàng</h2>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Xem nhanh tình trạng kinh doanh của bạn</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon="📦" label="Sản phẩm đang bán" value={stats.products} color="#0f3460" onClick={() => navigate('/seller/products')} />
        <StatCard icon="🛒" label="Tổng đơn hàng" value={stats.orders} color="#e94560" onClick={() => navigate('/seller/orders')} />
        <StatCard icon="💰" label="Doanh thu (đã xử lý)" value={`${stats.revenue.toLocaleString('vi-VN')}đ`} color="#10b981" />
        <StatCard icon="💬" label="Tin nhắn chưa đọc" value={stats.unread} color="#8b5cf6" onClick={() => navigate('/seller/messages')} />
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Đơn hàng gần đây</h3>
          <button
            onClick={() => navigate('/seller/orders')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: '#666', fontSize: '13px' }}
          >
            Xem tất cả →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Mã đơn', 'Người mua', 'Tổng tiền', 'Trạng thái', 'Thời gian'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => {
                  const s = statusConfig[order.status] || { label: order.status, color: '#888', bg: '#f3f4f6' };
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => navigate('/seller/orders')}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>#{order.id}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{order.username || 'Khách hàng'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#e94560' }}>{(order.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
