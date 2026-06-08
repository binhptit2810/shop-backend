import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Printer
} from 'lucide-react';
import { Order } from '../../types';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await API.get('/orders/my');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', error);
      showToast('Không thể tải lịch sử đơn hàng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }
    try {
      await API.put(`/orders/${orderId}/cancel`);
      showToast("Hủy đơn hàng thành công!", "success");
      fetchOrderHistory();
    } catch (error: any) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const message = error.response?.data?.message || "Không thể hủy đơn hàng.";
      showToast(message, "error");
    }
  };

  const getStatusTextAndStyle = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return { text: 'Chờ xác nhận', class: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40', icon: Clock };
      case 'CONFIRMED': 
        return { text: 'Đã xác nhận', class: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40', icon: CheckCircle };
      case 'SHIPPING': 
        return { text: 'Đang giao', class: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40', icon: Truck };
      case 'DELIVERED': 
        return { text: 'Đã giao', class: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40', icon: CheckCircle };
      case 'COMPLETED': 
        return { text: 'Hoàn thành', class: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40', icon: CheckCircle };
      case 'CANCELLED': 
        return { text: 'Đã hủy', class: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40', icon: XCircle };
      default: 
        return { text: status, class: 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800', icon: Clock };
    }
  };

  const filterOrders = () => {
    if (activeTab === 'ALL') return orders;
    if (activeTab === 'PENDING') return orders.filter(o => o.orderStatus === 'PENDING');
    if (activeTab === 'CONFIRMED') return orders.filter(o => o.orderStatus === 'CONFIRMED');
    if (activeTab === 'SHIPPING') return orders.filter(o => o.orderStatus === 'SHIPPING');
    if (activeTab === 'COMPLETED') return orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED');
    if (activeTab === 'CANCELLED') return orders.filter(o => o.orderStatus === 'CANCELLED');
    return orders;
  };

  const handlePrintInvoice = (order: Order) => {
    setSelectedInvoice(order);
    setTimeout(() => {
      const printContents = document.getElementById('orders-invoice-print')?.innerHTML;
      if (!printContents) return;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn mua hàng #${order.id}</title>
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                .invoice-header { border-bottom: 2px solid #ee4d2d; padding-bottom: 20px; margin-bottom: 20px; }
                .invoice-title { font-size: 24px; font-weight: bold; color: #ee4d2d; }
                .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 13px; }
                th { background-color: #f9f9f9; }
                .total-section { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; }
                .footer-text { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
              </style>
            </head>
            <body>
              ${printContents}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopee"></div>
      </div>
    );
  }

  const filteredOrders = filterOrders();

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 dark:text-gray-100 flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Đơn hàng của tôi</h1>
        <p className="text-[11px] md:text-xs text-gray-400 mt-1">Xem và quản lý thông tin trạng thái các đơn hàng bạn đã mua.</p>
      </div>

      {/* Tabs Filter (Shopee Style) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs flex overflow-x-auto text-[11px] md:text-xs font-bold scrollbar-none">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: 'Chờ xác nhận' },
          { key: 'CONFIRMED', label: 'Đã xác nhận' },
          { key: 'SHIPPING', label: 'Đang giao' },
          { key: 'COMPLETED', label: 'Đã giao' },
          { key: 'CANCELLED', label: 'Đã hủy' }
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[90px] md:min-w-[100px] text-center py-4 border-b-2 transition-all focus:outline-none whitespace-nowrap ${
              activeTab === tab.key 
                ? 'border-shopee text-shopee font-black' 
                : 'border-transparent text-gray-500 hover:text-shopee'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 md:p-16 text-center flex flex-col items-center justify-center shadow-xs">
          <Package size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          <span className="text-xs text-gray-400 font-semibold">Không tìm thấy đơn hàng nào tương ứng.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => {
            const statusInfo = getStatusTextAndStyle(order.orderStatus);
            const StatusIcon = statusInfo.icon;

            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-gray-50/50 dark:bg-gray-900/20 px-4 md:px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center text-[11px] md:text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Đơn hàng: #{order.id}</span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-lg border text-[9px] md:text-[10px] font-black flex items-center gap-1.5 ${statusInfo.class}`}>
                    <StatusIcon size={12} />
                    <span>{statusInfo.text}</span>
                  </span>
                </div>

                {/* Items */}
                <div className="px-4 md:px-5 py-1.5 md:py-2.5 flex flex-col divide-y divide-gray-50 dark:divide-gray-700">
                  {order.items?.map(item => (
                    <div key={item.id} className="py-3 flex gap-3 text-xs">
                      {item.imageUrl && (
                        <img 
                          src={getProductImageUrl(item.imageUrl)} 
                          alt={item.productName} 
                          className="w-12 h-12 object-contain rounded-lg border border-gray-100 dark:border-gray-750 bg-gray-50 dark:bg-zinc-800 p-1 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{item.productName}</h4>
                        <span className="text-[10px] text-gray-450 dark:text-gray-400 block mt-1 font-bold">Số lượng: x{item.quantity}</span>
                      </div>
                      <span className="font-extrabold text-gray-900 dark:text-white flex-shrink-0 self-center">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer details & Actions */}
                <div className="bg-gray-50/20 dark:bg-gray-900/10 px-4 md:px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="flex flex-col gap-1 text-[10px] md:text-[11px] text-gray-500 max-w-sm">
                    <span className="flex items-center gap-1.5"><Phone size={12} /> Số điện thoại: <strong className="text-gray-750 dark:text-gray-300">{order.phoneNumber}</strong></span>
                    <span className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5" /> Địa chỉ nhận: <strong className="text-gray-750 dark:text-gray-300">{order.shippingAddress}</strong></span>
                  </div>

                  <div className="flex flex-col gap-2.5 items-end w-full md:w-auto">
                    <div className="flex items-baseline gap-1.5 text-gray-600 dark:text-gray-300">
                      <span className="font-bold text-[11px]">Thành tiền:</span>
                      <span className="text-base md:text-lg font-black text-shopee">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end flex-wrap">
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="flex-1 sm:flex-initial border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-300 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 font-bold transition-all focus:outline-none text-xs"
                      >
                        <Printer size={13} />
                        <span>In hóa đơn</span>
                      </button>

                      {order.orderStatus === 'PENDING' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex-1 sm:flex-initial bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 font-bold transition-all focus:outline-none text-xs"
                        >
                          <XCircle size={13} />
                          <span>Hủy đơn</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Area (Hidden unless printing) */}
      {selectedInvoice && (
        <div id="orders-invoice-print" className="hidden">
          <div className="invoice-header">
            <div className="invoice-title">SHOPEESHOP INVOICE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div>
                <p><strong>Mã đơn hàng:</strong> #{selectedInvoice.id}</p>
                <p><strong>Ngày đặt hàng:</strong> {new Date(selectedInvoice.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><strong>Trạng thái:</strong> {selectedInvoice.orderStatus}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px', fontSize: '13px' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ee4d2d' }}>THÔNG TIN NGƯỜI NHẬN</h4>
              <p>Khách hàng: <strong>{selectedInvoice.username}</strong></p>
              <p>Số điện thoại: <strong>{selectedInvoice.phoneNumber}</strong></p>
              <p>Địa chỉ: <strong>{selectedInvoice.shippingAddress}</strong></p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#ee4d2d' }}>ĐƠN VỊ CUNG CẤP</h4>
              <p>Hệ thống: <strong>ShopeeShop E-Commerce Ltd.</strong></p>
              <p>Địa chỉ: 1 Cầu Giấy, Hà Nội, Việt Nam</p>
              <p>Website: www.shopeeshop.com</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items?.map(item => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-section">
            {selectedInvoice.voucherCode && (
              <p style={{ color: '#2ecc71', fontSize: '14px', margin: '0 0 6px 0' }}>
                Voucher áp dụng: {selectedInvoice.voucherCode} (-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.discountAmount || 0)})
              </p>
            )}
            <p style={{ color: '#ee4d2d' }}>
              Tổng cộng thanh toán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.totalPrice)}
            </p>
          </div>

          <div className="footer-text">
            Cảm ơn quý khách đã mua sắm tại ShopeeShop. Hẹn gặp lại quý khách!
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
