import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  User as UserIcon, 
  ShoppingBag, 
  Calendar,
  MapPin,
  Phone,
  Printer,
  XCircle,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  UserCheck
} from 'lucide-react';
import { Order } from '../../types';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSubTab, setOrderSubTab] = useState<string>('ALL');
  
  // Profile settings state
  const [fullName, setFullName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('0987654321');
  const [address, setAddress] = useState('123 Đường Trần Duy Hưng, Hà Nội');
  const [savingProfile, setSavingProfile] = useState(false);

  // Invoice view state
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    fetchMyOrders();
    if (user) {
      setFullName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await API.get('/orders/my');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử đơn hàng cá nhân:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }
    try {
      await API.put(`/orders/${orderId}/cancel`);
      showToast("Hủy đơn hàng thành công!", "success");
      fetchMyOrders();
    } catch (error: any) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const message = error.response?.data?.message || "Không thể hủy đơn hàng.";
      showToast(message, "error");
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      showToast("Cập nhật thông tin tài khoản thành công!", "success");
    }, 800);
  };

  const handlePrintInvoice = (order: Order) => {
    setSelectedInvoice(order);
    setTimeout(() => {
      const printContents = document.getElementById('invoice-print-area')?.innerHTML;
      if (!printContents) return;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn mua hàng #${order.id}</title>
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                .invoice-header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px; }
                .invoice-title { font-size: 24px; font-weight: bold; color: #4f46e5; }
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

  const getStatusTextAndStyle = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return { text: 'Chờ xác nhận', class: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40', icon: Clock };
      case 'CONFIRMED': 
        return { text: 'Đã xác nhận', class: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40', icon: CheckCircle };
      case 'SHIPPING': 
        return { text: 'Đang giao', class: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40', icon: Truck };
      case 'DELIVERED': 
        return { text: 'Đã giao', class: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40', icon: UserCheck };
      case 'COMPLETED': 
        return { text: 'Hoàn thành', class: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40', icon: CheckCircle };
      case 'CANCELLED': 
        return { text: 'Đã hủy', class: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40', icon: XCircle };
      default: 
        return { text: status, class: 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800', icon: Clock };
    }
  };

  const filterOrders = () => {
    if (orderSubTab === 'ALL') return orders;
    if (orderSubTab === 'PENDING') return orders.filter(o => o.orderStatus === 'PENDING');
    if (orderSubTab === 'CONFIRMED') return orders.filter(o => o.orderStatus === 'CONFIRMED');
    if (orderSubTab === 'SHIPPING') return orders.filter(o => o.orderStatus === 'SHIPPING');
    if (orderSubTab === 'COMPLETED') return orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED');
    if (orderSubTab === 'CANCELLED') return orders.filter(o => o.orderStatus === 'CANCELLED');
    return orders;
  };

  const activeOrders = filterOrders();

  const totalSpent = orders
    .filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 dark:text-gray-100">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-shopee text-white flex items-center justify-center font-bold text-base md:text-lg shadow select-none">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">{user?.username}</h3>
              <span className="text-[10px] text-gray-400">Thành viên BMart</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden text-xs flex flex-row md:flex-col">
            <button 
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`flex-1 md:flex-initial text-left px-4 py-3 flex items-center justify-center md:justify-start gap-2.5 transition-all border-b md:border-b-0 border-r md:border-r-0 md:border-b border-gray-100 dark:border-gray-700 focus:outline-none ${
                activeTab === 'profile' 
                  ? 'bg-orange-50/40 dark:bg-orange-950/20 text-shopee font-bold border-l-0 md:border-l-4 border-l-shopee' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              <UserIcon size={16} />
              <span>Hồ sơ tài khoản</span>
            </button>
            <button 
              onClick={() => setSearchParams({ tab: 'orders' })}
              className={`flex-1 md:flex-initial text-left px-4 py-3 flex items-center justify-center md:justify-start gap-2.5 transition-all focus:outline-none ${
                activeTab === 'orders' 
                  ? 'bg-orange-50/40 dark:bg-orange-950/20 text-shopee font-bold border-l-0 md:border-l-4 border-l-shopee' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              <ShoppingBag size={16} />
              <span>Đơn mua hàng</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/4 flex flex-col gap-6">
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 md:p-8 shadow-xs animate-fade-in">
              <div className="border-b border-gray-105 dark:border-gray-700 pb-3 mb-6">
                <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white">Hồ Sơ Của Tôi</h2>
                <p className="text-[11px] text-gray-400 mt-1">Quản lý thông tin hồ sơ cá nhân để bảo mật tài khoản.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {/* Form fields */}
                <div className="flex-1 flex flex-col gap-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-500 font-bold">Tên đăng nhập</label>
                      <input 
                        type="text" 
                        disabled
                        value={user?.username || ''}
                        className="text-xs px-3.5 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-500 font-bold">Địa chỉ Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-500 font-bold">Số điện thoại liên hệ</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-500 font-bold">Vai trò tài khoản</label>
                      <input 
                        type="text" 
                        disabled
                        value={user?.role || 'USER'}
                        className="text-xs px-3.5 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-bold capitalize"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-gray-500 font-bold">Địa chỉ giao hàng mặc định</label>
                    <textarea 
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee resize-y"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="bg-shopee hover:bg-shopee-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition-all self-start mt-2 focus:outline-none"
                  >
                    {savingProfile ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </button>
                </div>

                {/* Avatar uploader (Mocked display) */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-6 md:pt-0 md:pl-8 py-4 gap-3 self-center">
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                    <UserIcon size={48} className="md:w-16 md:h-16" />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => showToast("Chức năng tải lên avatar sẽ được liên kết ở phiên bản tiếp theo!", "info")}
                    className="border border-gray-250 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 px-4 py-2 text-[10px] font-bold rounded-xl shadow-xs transition-all bg-white dark:bg-gray-800 focus:outline-none"
                  >
                    Chọn ảnh đại diện
                  </button>
                  <span className="text-[9px] text-gray-400 text-center leading-normal">
                    Dụng lượng file tối đa 1 MB<br />Định dạng:.JPEG, .PNG
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY (5 Status tabs) */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Shopee-style Order Subtabs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs flex overflow-x-auto text-[11px] md:text-xs font-bold scrollbar-none">
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'PENDING', label: 'Chờ xác nhận' },
                  { key: 'CONFIRMED', label: 'Đã xác nhận' },
                  { key: 'SHIPPING', label: 'Đang giao' },
                  { key: 'COMPLETED', label: 'Đã giao' },
                  { key: 'CANCELLED', label: 'Đã hủy' }
                ].map(subTab => (
                  <button 
                    key={subTab.key}
                    onClick={() => setOrderSubTab(subTab.key)}
                    className={`flex-1 min-w-[90px] md:min-w-[100px] text-center py-4 border-b-2 transition-all focus:outline-none whitespace-nowrap ${
                      orderSubTab === subTab.key 
                        ? 'border-shopee text-shopee font-black' 
                        : 'border-transparent text-gray-500 hover:text-shopee'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* KPI Total Purchase Summary Box */}
              {orderSubTab === 'ALL' && !loadingOrders && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 md:p-5 text-white shadow-xs flex justify-between items-center animate-fade-in">
                  <div>
                    <span className="text-[9px] md:text-[10px] font-black opacity-90 uppercase tracking-wider">Tổng tích lũy mua sắm thành công</span>
                    <h2 className="text-xl md:text-2xl font-black mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent)}
                    </h2>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingBag size={20} className="md:w-6 md:h-6" />
                  </div>
                </div>
              )}

              {/* Order Items list */}
              {loadingOrders ? (
                <div className="flex justify-center items-center h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-shopee"></div>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center flex flex-col items-center justify-center shadow-xs">
                  <FileText size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
                  <span className="text-xs text-gray-400 font-bold">Không tìm thấy đơn hàng nào ở trạng thái này.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeOrders.map(order => {
                    const statusInfo = getStatusTextAndStyle(order.orderStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden flex flex-col"
                      >
                        {/* Order Header info */}
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

                        {/* Order Items list details */}
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

                        {/* Order Summary & Actions footer */}
                        <div className="bg-gray-50/20 dark:bg-gray-900/10 px-4 md:px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          {/* Shipping address details */}
                          <div className="flex flex-col gap-1 text-[10px] md:text-[11px] text-gray-500 max-w-sm">
                            <span className="flex items-center gap-1.5"><Phone size={12} /> Số điện thoại: <strong className="text-gray-700 dark:text-gray-300">{order.phoneNumber}</strong></span>
                            <span className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5" /> Địa chỉ nhận: <strong className="text-gray-700 dark:text-gray-300">{order.shippingAddress}</strong></span>
                          </div>

                          {/* Order pricing breakdown & actions */}
                          <div className="flex flex-col gap-2.5 items-end w-full md:w-auto">
                            <div className="flex items-baseline gap-1.5 text-gray-600 dark:text-gray-300">
                              <span className="font-bold text-[11px]">Thành tiền:</span>
                              <span className="text-base md:text-lg font-black text-shopee">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                              </span>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto justify-end flex-wrap">
                              {/* Print Invoice Button */}
                              <button 
                                onClick={() => handlePrintInvoice(order)}
                                className="flex-1 sm:flex-initial border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-300 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 font-bold transition-all focus:outline-none text-xs"
                              >
                                <Printer size={13} />
                                <span>In hóa đơn</span>
                              </button>

                              {/* Cancel Button */}
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
            </div>
          )}
        </div>
      </div>

      {/* INVOICE TEMPLATE (HIDDEN PRINT AREA) */}
      {selectedInvoice && (
        <div id="invoice-print-area" className="hidden">
          <div className="invoice-header">
            <div className="invoice-title">BMART INVOICE</div>
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
              <h4 style={{ margin: '0 0 8px 0', color: '#4f46e5' }}>THÔNG TIN NGƯỜI NHẬN</h4>
              <p>Khách hàng: <strong>{selectedInvoice.username}</strong></p>
              <p>Số điện thoại: <strong>{selectedInvoice.phoneNumber}</strong></p>
              <p>Địa chỉ: <strong>{selectedInvoice.shippingAddress}</strong></p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4f46e5' }}>ĐƠN VỊ CUNG CẤP</h4>
              <p>Hệ thống: <strong>BMart E-Commerce Ltd.</strong></p>
              <p>Địa chỉ: 1 Cầu Giấy, Hà Nội, Việt Nam</p>
              <p>Website: www.bmart.com</p>
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
            <p style={{ color: '#4f46e5' }}>
              Tổng cộng thanh toán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.totalPrice)}
            </p>
          </div>

          <div className="footer-text">
            Cảm ơn quý khách đã mua sắm tại BMart. Hẹn gặp lại quý khách!
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
