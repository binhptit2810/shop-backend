import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  DollarSign, 
  ClipboardList, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Gọi APIs đồng thời để lấy dữ liệu thực tế cho Dashboard
      const [resOrders, resProducts, resCategories] = await Promise.all([
        API.get('/orders'),
        API.get('/products'),
        API.get('/categories')
      ]);
      
      const orders = resOrders.data || [];
      const products = resProducts.data || [];
      
      // Tính toán các chỉ số thống kê thực tế từ DB
      const totalSales = orders
        .filter(o => o.orderStatus !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalPrice, 0);
      
      // Lấy danh sách tài khoản duy nhất từ các đơn hàng để ước lượng số user
      const uniqueUsers = new Set(orders.map(o => o.username));

      setStats({
        totalSales,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: uniqueUsers.size > 0 ? uniqueUsers.size + 1 : 1, // Cộng thêm admin
        recentOrders: orders.slice(0, 5) // Lấy 5 đơn hàng gần nhất
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
      showToast('Không thể tải một số thống kê chính xác.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'SHIPPING': return 'status-shipping';
      case 'DELIVERED': return 'status-delivered';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Tổng Quan Hệ Thống</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Xem các chỉ số KPI bán hàng, sản lượng sản phẩm và các đơn hàng vừa tiếp nhận.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Card 1: Doanh Thu */}
        <div className="glass-panel kpi-card">
          <div className="kpi-card-info">
            <span className="kpi-card-label">Tổng Doanh Thu</span>
            <span className="kpi-card-value" style={{ color: 'var(--accent)' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSales)}
            </span>
          </div>
          <div className="kpi-card-icon kpi-icon-emerald">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 2: Đơn Hàng */}
        <div className="glass-panel kpi-card">
          <div className="kpi-card-info">
            <span className="kpi-card-label">Tổng Đơn Hàng</span>
            <span className="kpi-card-value">{stats.totalOrders}</span>
          </div>
          <div className="kpi-card-icon kpi-icon-indigo">
            <ClipboardList size={24} />
          </div>
        </div>

        {/* Card 3: Sản Phẩm */}
        <div className="glass-panel kpi-card">
          <div className="kpi-card-info">
            <span className="kpi-card-label">Sản Phẩm Đang Bán</span>
            <span className="kpi-card-value">{stats.totalProducts}</span>
          </div>
          <div className="kpi-card-icon kpi-icon-amber">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Card 4: Thành Viên */}
        <div className="glass-panel kpi-card">
          <div className="kpi-card-info">
            <span className="kpi-card-label">Khách mua hàng</span>
            <span className="kpi-card-value">{stats.totalUsers}</span>
          </div>
          <div className="kpi-card-icon kpi-icon-rose">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Graphical Chart Mock & Recent Orders Table */}
      <div className="dashboard-grid">
        
        {/* Left Side: Mock Sales Trend Chart */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <span>Biểu đồ doanh thu tuần này</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Cập nhật 5 phút trước</span>
          </div>

          <div className="chart-panel-placeholder">
            {/* Custom CSS Bar Chart representing week trend */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '180px', width: '100%', maxWidth: '400px', margin: '20px auto 0' }}>
              {[
                { day: 'T2', val: '40%', amount: '12M' },
                { day: 'T3', val: '65%', amount: '22M' },
                { day: 'T4', val: '50%', amount: '17M' },
                { day: 'T5', val: '85%', amount: '35M' },
                { day: 'T6', val: '70%', amount: '26M' },
                { day: 'T7', val: '95%', amount: '48M' },
                { day: 'CN', val: '100%', amount: '52M' }
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>{item.amount}</span>
                  <div style={{
                    width: '100%',
                    height: item.val,
                    background: 'linear-gradient(to top, var(--primary) 30%, #818cf8 100%)',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 2px 8px var(--primary-glow)',
                    transition: 'all 0.5s ease-in-out'
                  }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Recent Orders */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--warning)" />
            <span>Đơn hàng mới tiếp nhận</span>
          </h3>

          {stats.recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Chưa tiếp nhận đơn hàng nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.recentOrders.map(order => (
                <div 
                  key={order.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <Link to="/admin/orders" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>#{order.id}</span>
                      <ArrowUpRight size={12} />
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {order.username} - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '14px' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                    </div>
                    <span 
                      style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}
                      className={getStatusClass(order.orderStatus)}
                    >
                      {translateStatus(order.orderStatus)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
