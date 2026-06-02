import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { showToast } from '../../services/toast';
import API, { getImageBaseUrl } from '../../services/api';
import { 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Grid, 
  Ticket, 
  ChevronRight,
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
      showToast("Vui lòng chọn ít danh mục sản phẩm cần mua!", "error");
      return;
    }

    if (cart?.cartItems) {
      const uncheckedItems = cart.cartItems.filter(item => !selectedItems[item.id]);
      
      // If user unselected some items, explain that checkout will check out all items in the cart
      // or we can remove the unchecked items. Let's offer a dialog or remove them.
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
    <div className="max-w-7xl mx-auto px-4 py-6 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-20 w-20 bg-orange-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-shopee mb-4">
            <ShoppingBag size={40} />
          </div>
          <h3 className="font-bold text-lg text-gray-950 dark:text-white mb-1">Giỏ hàng đang trống</h3>
          <p className="text-xs text-gray-400 mb-6">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng của mình.</p>
          <Link to="/" className="bg-shopee hover:bg-shopee-hover text-white text-xs font-semibold px-6 py-2.5 rounded-md transition-all shadow-sm">
            Tiếp tục mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Header select all */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={handleToggleSelectAll}
                  className="rounded text-shopee focus:ring-shopee h-4.5 w-4.5 cursor-pointer accent-shopee"
                />
                <span>Chọn tất cả ({items.length} sản phẩm)</span>
              </div>
              <span className="text-gray-400">Đơn giá</span>
            </div>

            {/* Cart Items Cards */}
            <div className="flex flex-col gap-3">
              {items.map(item => {
                const imgBase = getImageBaseUrl();
                const imgUrl = item.imageUrl 
                  ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${imgBase}${item.imageUrl}`) 
                  : 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200';

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all flex items-center gap-3 shadow-sm ${
                      selectedItems[item.id] ? 'border-orange-200 dark:border-orange-950/40 bg-orange-50/10' : 'border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={!!selectedItems[item.id]}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="rounded text-shopee focus:ring-shopee h-4.5 w-4.5 cursor-pointer accent-shopee flex-shrink-0"
                    />

                    <img 
                      src={imgUrl} 
                      alt={item.productName} 
                      className="w-16 h-16 object-contain rounded border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0 p-1"
                    />

                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-xs text-gray-900 dark:text-white truncate hover:text-shopee cursor-pointer">
                        <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="font-bold text-xs text-shopee">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                        <button 
                          onClick={() => handleQtyChange(item, -1)} 
                          className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 disabled:opacity-50 text-xs"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 text-xs font-semibold min-w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item, 1)} 
                          className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Vouchers section */}
            {activeVouchers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 shadow-sm mt-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Ticket size={16} className="text-shopee" />
                  <span>Chọn Shopee Voucher khả dụng</span>
                </h3>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {activeVouchers.map(v => (
                    <div 
                      key={v.id} 
                      className="border border-orange-100 dark:border-gray-700 rounded-md p-3 flex justify-between items-center bg-orange-50/20 dark:bg-gray-950/10 hover:border-orange-200 transition-all text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-shopee tracking-wider bg-shopee/10 px-1.5 py-0.5 rounded text-[10px]">
                            {v.code}
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discountAmount)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Đơn tối thiểu {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minOrderValue)} • HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setVoucherCode(v.code);
                          handleApplyVoucher(v.code);
                        }}
                        className="bg-shopee text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-shopee-hover transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary Panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2.5">
                Thanh toán đơn hàng
              </h3>
              
              {/* Voucher Code Manual Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Nhập mã giảm giá:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mã voucher..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 focus:outline-none focus:border-shopee"
                  />
                  <button 
                    onClick={() => handleApplyVoucher(voucherCode)}
                    disabled={checkingVoucher}
                    className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    {checkingVoucher ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-1 rounded">
                    <span>Đã áp dụng: <strong>{appliedVoucher.code}</strong></span>
                    <button 
                      onClick={() => {
                        setAppliedVoucher(null);
                        setDiscountAmount(0);
                        setVoucherCode('');
                        localStorage.removeItem('appliedVoucherCode');
                        showToast("Đã hủy áp dụng voucher.", "info");
                      }}
                      className="underline text-[10px]"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-2 pt-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Vận chuyển:</span>
                  <span className="font-semibold text-emerald-500">Miễn phí</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-shopee">
                    <span>Giảm giá Voucher:</span>
                    <span>
                      -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-1 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-600 p-2 rounded mt-1">
                  <Info size={14} className="flex-shrink-0" />
                  <span>Thanh toán toàn bộ giỏ hàng của bạn theo chính sách giao dịch.</span>
                </div>
                
                <div className="flex justify-between items-baseline border-t border-gray-100 dark:border-gray-700 pt-3 mt-2 font-bold text-sm">
                  <span className="text-gray-900 dark:text-white">Tổng thanh toán:</span>
                  <span className="text-lg text-shopee font-extrabold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={handleCheckoutRedirect}
                className="w-full bg-shopee hover:bg-shopee-hover text-white font-semibold py-3 px-4 rounded-md transition-all text-xs flex items-center justify-center gap-2 shadow-sm mt-1.5"
              >
                <CreditCard size={16} />
                <span>Tiến hành mua hàng ({getSelectedCount()})</span>
              </button>

              <Link 
                to="/" 
                className="text-center text-xs text-gray-400 hover:text-shopee transition-colors mt-1"
              >
                Quay lại Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
