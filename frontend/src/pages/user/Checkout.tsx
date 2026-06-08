import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { showToast } from '../../services/toast';
import confetti from 'canvas-confetti';
import { CheckCircle, Truck, Phone, MapPin, ArrowLeft, Ticket } from 'lucide-react';
import { Order } from '../../types';

const Checkout = () => {
  const { cart, clearCartLocal, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [voucherCode, setVoucherCode] = useState(localStorage.getItem('appliedVoucherCode') || '');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<Order | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      if (!isSuccess) {
        showToast('Giỏ hàng trống! Không thể tiến hành thanh toán.', 'error');
        navigate('/');
      }
    }
  }, [cart, navigate, isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin giao hàng!', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/orders/checkout', {
        shippingAddress: shippingAddress.trim(),
        phoneNumber: phoneNumber.trim(),
        voucherCode: voucherCode.trim() || null
      });
      
      const order: Order = response.data;
      setOrderInfo(order);
      setIsSuccess(true);
      clearCartLocal();
      localStorage.removeItem('appliedVoucherCode'); // Clean up
      
      // Fire celebration confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('Đặt hàng thành công!', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess && orderInfo) {
    return (
      <div className="max-w-xl mx-auto px-2 md:px-4 py-8 md:py-12 dark:text-gray-100 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 text-center flex flex-col items-center justify-center shadow-md">
          <CheckCircle size={56} className="text-emerald-500 mb-4" />
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-xs text-gray-400 mb-6 max-w-sm">
            Đơn hàng của bạn đã được hệ thống tiếp nhận thành công. Trạng thái đơn hàng hiện tại là <strong className="text-shopee">Chờ xử lý (PENDING)</strong>.
          </p>

          <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 md:p-5 text-left border border-gray-100 dark:border-gray-800 mb-6 text-xs flex flex-col gap-3">
            <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
              <span>Thông tin chi tiết đơn hàng</span>
              <span className="text-shopee font-extrabold">#{orderInfo.id}</span>
            </h4>
            <div className="flex flex-col gap-2.5 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Người nhận hàng:</span>
                <span className="font-bold text-gray-900 dark:text-white">{orderInfo.username}</span>
              </div>
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <span className="font-bold text-gray-900 dark:text-white">{orderInfo.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="flex-shrink-0">Địa chỉ nhận:</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[200px] sm:max-w-xs">{orderInfo.shippingAddress}</span>
              </div>
              {orderInfo.voucherCode && (
                <div className="flex justify-between text-emerald-500">
                  <span>Mã giảm giá đã áp dụng:</span>
                  <span className="font-black">{orderInfo.voucherCode} (-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.discountAmount || 0)})</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-1 font-bold text-gray-900 dark:text-white text-xs md:text-sm">
                <span>Tổng thanh toán:</span>
                <span className="text-shopee font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Link to="/" className="flex-1 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold py-3 rounded-xl transition-colors text-center focus:outline-none">
              Tiếp tục mua sắm
            </Link>
            <Link to="/profile?tab=orders" className="flex-1 bg-shopee hover:bg-shopee-hover text-white text-xs font-bold py-3 rounded-xl transition-colors text-center shadow-xs focus:outline-none">
              Kiểm tra đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 dark:text-gray-100">
      <div className="mb-4">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-shopee text-xs md:text-sm font-bold transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span>Quay lại giỏ hàng</span>
        </Link>
      </div>

      <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4 md:mb-6">Thanh toán đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Checkout Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col gap-4.5">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2.5">
            <Truck size={16} className="text-shopee" />
            <span>Địa chỉ nhận hàng (Shopee style)</span>
          </h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-[11px] text-gray-550 flex items-center gap-1.5 font-bold">
              <Phone size={13} />
              <span>Số điện thoại liên hệ</span>
            </label>
            <input 
              type="tel" 
              id="phone" 
              className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee"
              placeholder="Nhập số điện thoại người nhận..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="address" className="text-[11px] text-gray-550 flex items-center gap-1.5 font-bold">
              <MapPin size={13} />
              <span>Địa chỉ giao nhận chi tiết</span>
            </label>
            <textarea 
              id="address" 
              className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee resize-y"
              placeholder="Ví dụ: Số 12, Ngõ 45, Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội..."
              rows={4}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="voucher" className="text-[11px] text-gray-550 flex items-center gap-1.5 font-bold">
              <Ticket size={13} />
              <span>Mã giảm giá đang áp dụng</span>
            </label>
            <input 
              type="text" 
              id="voucher" 
              disabled
              className="text-xs px-3.5 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-bold tracking-wider"
              value={voucherCode ? voucherCode : 'Không có voucher nào được áp dụng từ giỏ hàng'}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-shopee hover:bg-shopee-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-xs mt-3 focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Đang thực hiện giao dịch...' : 'Xác nhận Đặt hàng ngay'}
          </button>
        </form>

        {/* Mini Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col gap-3.5 self-start">
          <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-1">
            <span>Tóm tắt sản phẩm mua</span>
          </h3>
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {cart.cartItems?.map(item => (
              <div key={item.id} className="flex justify-between items-start text-xs text-gray-600 dark:text-gray-300 gap-4">
                <span className="truncate flex-1 max-w-[200px]" title={item.productName}>
                  {item.productName} <span className="font-bold text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-bold text-gray-950 dark:text-white flex-shrink-0">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-baseline font-bold text-gray-950 dark:text-white">
            <span className="text-xs">Tổng tiền tạm tính:</span>
            <span className="text-shopee text-base font-extrabold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
