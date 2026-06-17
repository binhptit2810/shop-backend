import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { showToast } from '../../services/toast';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Ticket, 
  Info
} from 'lucide-react';
import { Voucher } from '../../types';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Checkboxes state
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCart();
    fetchActiveVouchers();
    // Clear previously saved voucher
    localStorage.removeItem('appliedVoucherCode');
  }, []);

  // Sync checkboxes when cart items load
  useEffect(() => {
    if (cart?.cartItems) {
      const initialSelected: Record<number, boolean> = {};
      cart.cartItems.forEach(item => {
        initialSelected[item.id] = true; // Select all by default
      });
      setSelectedItems(initialSelected);
    }
  }, [cart]);

  const fetchActiveVouchers = async () => {
    try {
      const response = await API.get('/vouchers');
      setActiveVouchers(response.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher:", error);
    }
  };

  const handleQtyChange = async (item: any, val: number) => {
    const newQty = item.quantity + val;
    if (newQty < 1) return;
    
    const res = await updateQuantity(item.id, newQty);
    if (!res.success) {
      showToast(res.message, 'error');
    } else {
      // Recalculate voucher if one was already applied
      if (appliedVoucher) {
        recalculateVoucher(appliedVoucher, cart.totalPrice);
      }
    }
  };

  const handleRemove = async (itemId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return;
    }
    const res = await removeFromCart(itemId);
    if (res.success) {
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
      if (appliedVoucher) {
        recalculateVoucher(appliedVoucher, cart.totalPrice);
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  // Toggle selection
  const handleToggleSelectItem = (id: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleSelectAll = () => {
    const allSelected = isAllSelected();
    const newSelected: Record<number, boolean> = {};
    if (cart?.cartItems) {
      cart.cartItems.forEach(item => {
        newSelected[item.id] = !allSelected;
      });
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected = () => {
    if (!cart?.cartItems || cart.cartItems.length === 0) return false;
    return cart.cartItems.every(item => selectedItems[item.id]);
  };

  const getSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  const getSelectedTotalPrice = () => {
    if (!cart?.cartItems) return 0;
    return cart.cartItems
      .filter(item => selectedItems[item.id])
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Apply Voucher logic
  const handleApplyVoucher = async (codeStr: string) => {
    const code = codeStr.trim().toUpperCase();
    if (!code) {
      showToast("Vui lòng nhập mã giảm giá!", "error");
      return;
    }

    setCheckingVoucher(true);
    const orderVal = getSelectedTotalPrice();

    if (orderVal === 0) {
      showToast("Vui lòng chọn ít nhất 1 sản phẩm trước khi áp dụng voucher!", "error");
      setCheckingVoucher(false);
      return;
    }

    try {
      // 1. Get voucher info
      const voucherRes = await API.get(`/vouchers/${code}`);
      const v: Voucher = voucherRes.data;

      // Validate min order value
      if (orderVal < v.minOrderValue) {
        showToast(`Đơn hàng chưa đạt giá trị tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minOrderValue)} để áp dụng mã này.`, 'error');
        setCheckingVoucher(false);
        return;
      }

      // 2. Calculate discount amount from API
      const discountRes = await API.post(`/vouchers/apply?code=${code}&orderValue=${orderVal}`);
      const discountVal = parseFloat(discountRes.data);

      setAppliedVoucher(v);
      setDiscountAmount(discountVal);
      localStorage.setItem('appliedVoucherCode', code);
      showToast(`Áp dụng mã giảm giá ${code} thành công! Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountVal)}`, 'success');
    } catch (error: any) {
      console.error("Lỗi áp dụng voucher:", error);
      showToast(error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn!", "error");
      setAppliedVoucher(null);
      setDiscountAmount(0);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const recalculateVoucher = async (v: Voucher, orderVal: number) => {
    if (orderVal < v.minOrderValue) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      localStorage.removeItem('appliedVoucherCode');
      return;
    }
    try {
      const discountRes = await API.post(`/vouchers/apply?code=${v.code}&orderValue=${orderVal}`);
      setDiscountAmount(parseFloat(discountRes.data));
    } catch (e) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      localStorage.removeItem('appliedVoucherCode');
    }
  };

  const handleCheckoutRedirect = async () => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) {
      showToast("Vui lòng chọn sản phẩm cần mua!", "error");
      return;
    }

    if (cart?.cartItems) {
      const uncheckedItems = cart.cartItems.filter(item => !selectedItems[item.id]);
      
      // If user unselected some items, explain that checkout will check out all items in the cart
      if (uncheckedItems.length > 0) {
        const confirmCheckout = window.confirm(
          `Bạn đã bỏ chọn ${uncheckedItems.length} sản phẩm. Đơn đặt hàng sẽ thanh toán toàn bộ sản phẩm trong giỏ hàng. Bạn có muốn tiếp tục mua tất cả không?`
        );
        if (!confirmCheckout) return;
      }
    }

    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopee"></div>
      </div>
    );
  }

  const items = cart?.cartItems || [];
  const selectedTotal = getSelectedTotalPrice();
  const finalPrice = Math.max(0, selectedTotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 dark:text-gray-100 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4 md:mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-orange-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-shopee mb-4">
            <ShoppingBag size={32} className="md:w-10 md:h-10" />
          </div>
          <h3 className="font-bold text-base md:text-lg text-gray-950 dark:text-white mb-1">Giỏ hàng đang trống</h3>
          <p className="text-[11px] md:text-xs text-gray-400 mb-6">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng của mình.</p>
          <Link to="/" className="bg-shopee hover:bg-shopee-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-xs">
            Tiếp tục mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-slide-up">
          {/* List of Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-3 md:gap-4">
            {/* Header select all */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 shadow-xs">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={handleToggleSelectAll}
                  className="rounded text-shopee focus:ring-shopee h-4.5 w-4.5 cursor-pointer accent-shopee"
                />
                <span>Chọn tất cả ({items.length} sản phẩm)</span>
              </div>
              <span className="text-gray-400 hidden sm:inline">Đơn giá</span>
            </div>

            {/* Cart Items Cards */}
            <div className="flex flex-col gap-2.5">
              {items.map(item => {
                const imgUrl = getProductImageUrl(item.imageUrl);

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 border transition-all flex items-start md:items-center gap-2.5 md:gap-3 shadow-xs ${
                      selectedItems[item.id] ? 'border-orange-200 dark:border-orange-950/40 bg-orange-50/5' : 'border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={!!selectedItems[item.id]}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="rounded text-shopee focus:ring-shopee h-4.5 w-4.5 cursor-pointer accent-shopee flex-shrink-0 mt-1 md:mt-0"
                    />

                    <img 
                      src={imgUrl} 
                      alt={item.productName} 
                      className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-lg border border-gray-105 dark:border-gray-700 bg-gray-50 flex-shrink-0 p-0.5"
                    />

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                      {/* Title and Price */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 hover:text-shopee cursor-pointer transition-colors leading-snug">
                          <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-extrabold text-xs text-shopee">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-3.5 mt-1 sm:mt-0 flex-shrink-0">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                          <button 
                            onClick={() => handleQtyChange(item, -1)} 
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 disabled:opacity-50 text-xs font-bold focus:outline-none"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-black min-w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleQtyChange(item, 1)} 
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-xs font-bold focus:outline-none"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => handleRemove(item.id)} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 focus:outline-none"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Vouchers section */}
            {activeVouchers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-xs mt-1">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Ticket size={16} className="text-shopee" />
                  <span>BMart Voucher khả dụng</span>
                </h3>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {activeVouchers.map(v => (
                    <div 
                      key={v.id} 
                      className="border border-orange-100 dark:border-gray-700 rounded-xl p-3 flex justify-between items-center bg-orange-50/20 dark:bg-gray-950/10 hover:border-orange-200 transition-all text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-shopee tracking-wider bg-shopee/10 px-1.5 py-0.5 rounded text-[9px] uppercase">
                            {v.code}
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            Giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discountAmount)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-455 dark:text-gray-400 mt-1">
                          Đơn tối thiểu {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minOrderValue)} • HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setVoucherCode(v.code);
                          handleApplyVoucher(v.code);
                        }}
                        className="bg-shopee text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-shopee-hover transition-colors focus:outline-none flex-shrink-0"
                      >
                        Áp dụng
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Spacer for mobile view to prevent layout overlap with bottom bar */}
            <div className="h-16 lg:hidden" />
          </div>

          {/* Cart Summary Panel (Right side) */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                Thông tin thanh toán
              </h3>
              
              {/* Voucher Code Manual Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-gray-500 font-bold">Nhập mã giảm giá:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mã voucher..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee"
                  />
                  <button 
                    onClick={() => handleApplyVoucher(voucherCode)}
                    disabled={checkingVoucher}
                    className="bg-gray-850 dark:bg-gray-700 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex-shrink-0 focus:outline-none"
                  >
                    {checkingVoucher ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-[10px] md:text-[11px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-1 rounded-lg">
                    <span>Đã áp dụng: <strong>{appliedVoucher.code}</strong></span>
                    <button 
                      onClick={() => {
                        setAppliedVoucher(null);
                        setDiscountAmount(0);
                        setVoucherCode('');
                        localStorage.removeItem('appliedVoucherCode');
                        showToast("Đã hủy áp dụng voucher.", "info");
                      }}
                      className="underline text-[9px] font-bold"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2 pt-1 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Vận chuyển:</span>
                  <span className="font-bold text-emerald-500">Miễn phí</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-shopee">
                    <span>Giảm giá Voucher:</span>
                    <span className="font-bold">
                      -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-1 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-600 p-2 rounded-lg mt-1 leading-relaxed">
                  <Info size={13} className="flex-shrink-0 mt-0.5" />
                  <span>Vui lòng chọn chính xác các mặt hàng mong muốn trước khi bấm Mua hàng.</span>
                </div>
                
                <div className="flex justify-between items-baseline border-t border-gray-150 dark:border-gray-700 pt-3 mt-2 font-bold text-sm">
                  <span className="text-gray-900 dark:text-white">Tổng thanh toán:</span>
                  <span className="text-base md:text-lg text-shopee font-black">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA (Visible on Desktop >= 1024px, hidden on Mobile/Tablet summary card to avoid duplication) */}
              <button 
                onClick={handleCheckoutRedirect}
                className="hidden lg:flex w-full bg-shopee hover:bg-shopee-hover text-white font-bold py-3 px-4 rounded-xl transition-all text-xs items-center justify-center gap-2 shadow-xs mt-1.5 focus:outline-none"
              >
                <CreditCard size={15} />
                <span>Tiến hành mua hàng ({getSelectedCount()})</span>
              </button>

              <Link 
                to="/" 
                className="text-center text-[11px] text-gray-400 hover:text-shopee transition-colors mt-1 font-semibold"
              >
                Quay lại Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Bar for Mobile/Tablet (< 1024px) */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 px-4 py-3.5 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 animate-fade-in">
          <div className="flex items-center gap-2 flex-shrink-0">
            <input 
              type="checkbox"
              checked={isAllSelected()}
              onChange={handleToggleSelectAll}
              className="rounded text-shopee focus:ring-shopee h-4.5 w-4.5 cursor-pointer accent-shopee"
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Tất cả</span>
          </div>

          <div className="flex flex-col items-end flex-1 min-w-0 pr-1.5">
            <div className="flex items-baseline gap-1 flex-wrap justify-end">
              <span className="text-[10px] text-gray-500 font-bold">Tổng cộng:</span>
              <span className="text-sm font-black text-shopee">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
              </span>
            </div>
            {discountAmount > 0 && (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                Đã giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
              </span>
            )}
          </div>

          <button 
            onClick={handleCheckoutRedirect}
            className="bg-shopee hover:bg-shopee-hover text-white font-bold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-xs focus:outline-none flex-shrink-0"
          >
            <CreditCard size={14} />
            <span>Mua hàng ({getSelectedCount()})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
