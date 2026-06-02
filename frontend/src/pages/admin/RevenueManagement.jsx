import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent, 
  Calendar,
  ChevronRight,
  RefreshCw,
  Award
} from 'lucide-react';

const RevenueManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // 7 or 30 days
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    successfulOrders: 0,
    cancelledOrders: 0,
    topProducts: [],
    dailyChartData: []
  });

  useEffect(() => {
    fetchOrdersAndCalculateStats();
  }, [timeRange]);

  const fetchOrdersAndCalculateStats = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      const allOrders = response.data || [];
      setOrders(allOrders);
      calculateMetrics(allOrders);
    } catch (error) {
      console.error('Lỗi khi tính toán báo cáo doanh thu:', error);
      showToast('Không thể tải báo cáo doanh thu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (allOrders) => {
    // Filter out cancelled orders for revenue calculation
    const nonCancelledOrders = allOrders.filter(o => o.orderStatus !== 'CANCELLED');
    const totalRev = nonCancelledOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrdersCount = allOrders.length;
    const avgVal = nonCancelledOrders.length > 0 ? totalRev / nonCancelledOrders.length : 0;
    
    const successful = allOrders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length;
    const cancelled = allOrders.filter(o => o.orderStatus === 'CANCELLED').length;

    // 1. Calculate Top Selling Products
    const productSales = {};
    allOrders.forEach(order => {
      // Only count items in confirmed, shipping or delivered orders
      if (order.orderStatus !== 'CANCELLED') {
        order.items?.forEach(item => {
          const name = item.productName || 'Sản phẩm không tên';
          if (!productSales[name]) {
            productSales[name] = { name, quantity: 0, revenue: 0 };
          }
          productSales[name].quantity += item.quantity || 0;
          productSales[name].revenue += (item.price || 0) * (item.quantity || 0);
        });
      }
    });

    const topProds = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // top 5

    // 2. Generate daily chart data for the last X days
    const dailyDataMap = {};
    const today = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      dailyDataMap[dateString] = 0;
    }

    nonCancelledOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dateString = orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dailyDataMap[dateString] !== undefined) {
        dailyDataMap[dateString] += order.totalPrice || 0;
      }
    });

    const dailyChart = Object.entries(dailyDataMap).map(([date, revenue]) => ({
      date,
      revenue
    }));

    setStats({
      totalRevenue: totalRev,
      totalOrders: totalOrdersCount,
      avgOrderValue: avgVal,
      successfulOrders: successful,
      cancelledOrders: cancelled,
      topProducts: topProds,
      dailyChartData: dailyChart
    });
  };

  const maxDailyRevenue = Math.max(...stats.dailyChartData.map(d => d.revenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Doanh Thu & Báo Cáo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Phân tích số liệu tài chính, hiệu suất bán hàng và danh sách sản phẩm bán chạy nhất.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${timeRange === 7 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setTimeRange(7)}
          >
            7 ngày qua
          </button>
          <button 
            className={`btn ${timeRange === 30 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setTimeRange(30)}
          >
            30 ngày qua
          </button>
          <button 
            onClick={fetchOrdersAndCalculateStats} 
            className="btn btn-secondary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px' }}
            title="Làm mới báo cáo"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          {/* Stats KPI Cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-panel kpi-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>TỔNG DOANH THU</span>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--accent)' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                (Không tính đơn hàng đã hủy)
              </p>
            </div>

            <div className="glass-panel kpi-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>ĐƠN HÀNG HỆ THỐNG</span>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                {stats.totalOrders}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Gồm cả đơn chưa duyệt và đã hủy
              </p>
            </div>

            <div className="glass-panel kpi-card" style={{ padding: '20px', borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>TRUNG BÌNH ĐƠN</span>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--success)' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.avgOrderValue)}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Giá trị trung bình đơn hàng phát sinh
              </p>
            </div>

            <div className="glass-panel kpi-card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>TỶ LỆ HỦY ĐƠN</span>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>
                {stats.totalOrders > 0 ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stats.cancelledOrders} đơn hàng đã bị hủy bỏ
              </p>
            </div>
          </div>

          {/* Revenue Chart Section */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--primary)" />
              <span>Biểu Đồ Doanh Thu Theo Ngày ({timeRange} ngày gần nhất)</span>
            </h3>

            {/* Custom Flex Column Bar Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'space-between',
                height: '240px', 
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '8px',
                paddingTop: '20px',
                gap: '8px'
              }}>
                {stats.dailyChartData.map((data, index) => {
                  const percentHeight = (data.revenue / maxDailyRevenue) * 90; // scale to 90% max height
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Bar Value Tooltip */}
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: 700, 
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        visibility: data.revenue > 0 ? 'visible' : 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {data.revenue >= 1000000 ? `${(data.revenue / 1000000).toFixed(1)}M` : `${(data.revenue / 1000).toFixed(0)}k`}
                      </span>
                      {/* Bar Column */}
                      <div style={{ 
                        width: '100%', 
                        maxWidth: timeRange === 7 ? '48px' : '16px',
                        height: `${Math.max(percentHeight, 2)}%`,
                        background: 'linear-gradient(180deg, var(--primary) 0%, rgba(99, 102, 241, 0.4) 100%)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease-in-out',
                        position: 'relative',
                        cursor: 'pointer'
                      }} title={`${data.date}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.revenue)}`}>
                      </div>
                      {/* X-axis Label */}
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: 'var(--text-muted)', 
                        marginTop: '8px',
                        transform: timeRange === 30 ? 'rotate(-45deg)' : 'none',
                        whiteSpace: 'nowrap'
                      }}>
                        {data.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent)" />
              <span>Top Sản Phẩm Bán Chạy Nhất</span>
            </h3>

            <div className="table-wrapper">
              {stats.topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  Chưa có sản phẩm nào bán ra trong khoảng thời gian này.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Hạng</th>
                      <th>Tên Sản Phẩm</th>
                      <th style={{ textAlign: 'center' }}>Số Lượng Bán</th>
                      <th>Doanh Thu Đóng Góp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((p, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 800, fontSize: '16px', color: index === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          #{index + 1}
                        </td>
                        <td style={{ fontWeight: 700 }}>{p.name}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {p.quantity}
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--success)' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueManagement;
