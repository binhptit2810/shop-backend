import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  Phone, 
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ArrowUpDown
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Mới nhất) hoặc 'asc' (Cũ nhất)

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      showToast('Không thể lấy danh sách đơn hàng từ hệ thống.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${newStatus}`);
      showToast(`Cập nhật đơn hàng #${orderId} sang trạng thái ${translateStatusOnly(newStatus)} thành công!`);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
      showToast(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.', 'error');
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

  const translateStatusOnly = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PENDING': return '🟡 Chờ xử lý';
      case 'CONFIRMED': return '🔵 Đã xác nhận';
      case 'SHIPPING': return '🟠 Đang giao hàng';
      case 'DELIVERED': return '🟢 Đã giao hàng';
      case 'COMPLETED': return '✅ Hoàn thành';
      case 'CANCELLED': return '🔴 Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} color="#b45309" />;
      case 'CONFIRMED': return <CheckCircle size={16} color="var(--primary)" />;
      case 'SHIPPING': return <Truck size={16} color="#ea580c" />;
      case 'DELIVERED': return <CheckCircle size={16} color="#059669" />;
      case 'COMPLETED': return <CheckCircle size={16} color="#047857" />;
      case 'CANCELLED': return <XCircle size={16} color="var(--error)" />;
      default: return null;
    }
  };

  // State transition validator for UI disabling
  const isTransitionDisabled = (currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return false;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') return true;
    
    switch (currentStatus) {
      case 'PENDING':
        return targetStatus !== 'CONFIRMED' && targetStatus !== 'CANCELLED';
      case 'CONFIRMED':
        return targetStatus !== 'SHIPPING';
      case 'SHIPPING':
        return targetStatus !== 'DELIVERED';
      case 'DELIVERED':
        return targetStatus !== 'COMPLETED';
      default:
        return true;
    }
  };

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' ? true : order.orderStatus === filterStatus;
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      (order.username && order.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.phoneNumber && order.phoneNumber.includes(searchTerm));
    
    return matchesStatus && matchesSearch;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Đơn Hàng</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Xem, cập nhật trạng thái đơn hàng và kiểm tra thông tin giao dịch của khách hàng.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw size={15} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Stats mini */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel kpi-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TẤT CẢ ĐƠN HÀNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{orders.length}</h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #b45309', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>CHỜ XỬ LÝ</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#b45309' }}>
            {orders.filter(o => o.orderStatus === 'PENDING').length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #ea580c', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ĐANG GIAO</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#ea580c' }}>
            {orders.filter(o => o.orderStatus === 'SHIPPING').length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #047857', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ĐÃ HOÀN THÀNH</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#047857' }}>
            {orders.filter(o => o.orderStatus === 'COMPLETED').length}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '280px', marginBottom: 0 }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, khách hàng, số điện thoại..." 
            className="input-field" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Sorting */}
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
            className="btn btn-secondary"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '42px', padding: '0 16px' }}
          >
            <ArrowUpDown size={15} />
            <span>Sắp xếp: {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lọc:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  className={`category-chip ${filterStatus === status ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'ALL' ? 'Tất cả' : translateStatusOnly(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            {sortedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách Hàng</th>
                    <th>Ngày Đặt</th>
                    <th>Sản Phẩm Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Thông Tin Nhận Hàng</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700 }}>#{order.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <User size={14} color="var(--primary)" />
                          <span>{order.username || `User #${order.userId}`}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>
                      <td>
                        <div className="order-items-mini" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {order.items?.map(item => (
                            <div key={item.id} style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                              • {item.productName} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '15px' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <Phone size={12} />
                          <span>{order.phoneNumber}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '4px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '200px' }}>
                          <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{order.shippingAddress}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`order-status ${getStatusClass(order.orderStatus)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '12px' }}>
                          {getStatusIcon(order.orderStatus)}
                          <span>{translateStatusOnly(order.orderStatus)}</span>
                        </span>
                      </td>
                      <td>
                        <select 
                          value={order.orderStatus} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          disabled={order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED'}
                          className="input-field"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '13px', 
                            background: order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED' ? '#e2e8f0' : 'var(--bg-tertiary)', 
                            borderRadius: '8px', 
                            cursor: order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED' ? 'not-allowed' : 'pointer', 
                            border: '1px solid var(--border-color)', 
                            fontWeight: 600,
                            color: order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED' ? '#94a3b8' : 'var(--text-primary)'
                          }}
                        >
                          <option value="PENDING" disabled={isTransitionDisabled(order.orderStatus, 'PENDING')}>Chờ xử lý</option>
                          <option value="CONFIRMED" disabled={isTransitionDisabled(order.orderStatus, 'CONFIRMED')}>Đã xác nhận</option>
                          <option value="SHIPPING" disabled={isTransitionDisabled(order.orderStatus, 'SHIPPING')}>Đang giao hàng</option>
                          <option value="DELIVERED" disabled={isTransitionDisabled(order.orderStatus, 'DELIVERED')}>Đã giao hàng</option>
                          <option value="COMPLETED" disabled={isTransitionDisabled(order.orderStatus, 'COMPLETED')}>Hoàn thành</option>
                          <option value="CANCELLED" disabled={isTransitionDisabled(order.orderStatus, 'CANCELLED')}>Hủy đơn hàng</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
