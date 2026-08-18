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

  // Map state
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapLoading, setMapLoading] = useState(false);

  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  useEffect(() => {
    fetchCart();

    // Dynamically load Leaflet script and stylesheet
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.id = 'leaflet-js';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep Leaflet in window to avoid loading twice on page change
    };
  }, []);

  useEffect(() => {
    if (showMap && leafletLoaded) {
      const timer = setTimeout(() => {
        initMap();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    }
  }, [showMap, leafletLoaded]);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || mapRef.current) return;

    // Fix default marker icon path issue in leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const defaultCenter = [21.0285, 105.8542]; // Ha Noi
    
    const map = L.map('checkout-map').setView(defaultCenter, 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker(defaultCenter, { draggable: true }).addTo(map);
    markerRef.current = marker;

    map.on('click', (e: any) => {
      updateLocation(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updateLocation(pos.lat, pos.lng);
    });

    // Request GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Lỗi định vị GPS:", err);
          updateLocation(defaultCenter[0], defaultCenter[1]);
        }
      );
    } else {
      updateLocation(defaultCenter[0], defaultCenter[1]);
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    const L = (window as any).L;
    if (!L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapRef.current) {
      mapRef.current.panTo([lat, lng]);
    }

    setMapLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`);
      const data = await response.json();
      if (data && data.display_name) {
        setShippingAddress(data.display_name);
      }
    } catch (err) {
      console.error("Lỗi chuyển đổi tọa độ sang địa chỉ:", err);
    } finally {
      setMapLoading(false);
    }
  };

  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim() || !leafletLoaded) return;

    setMapLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch.trim())}&limit=1&accept-language=vi`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        updateLocation(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.setZoom(16);
        }
      } else {
        showToast("Không tìm thấy địa điểm trên bản đồ!", "error");
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm bản đồ:", err);
      showToast("Có lỗi xảy ra khi tìm địa chỉ.", "error");
    } finally {
      setMapLoading(false);
    }
  };

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
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 text-center flex flex-col items-center justify-center shadow-md">
          <CheckCircle size={56} className="text-emerald-500 mb-4" />
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-xs text-gray-400 mb-6 max-w-sm">
            Đơn hàng của bạn đã được hệ thống tiếp nhận thành công. Trạng thái đơn hàng hiện tại là <strong className="text-primary">Chờ xử lý (PENDING)</strong>.
          </p>

          <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-sm p-4 md:p-5 text-left border border-gray-100 dark:border-gray-800 mb-6 text-xs flex flex-col gap-3">
            <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
              <span>Thông tin chi tiết đơn hàng</span>
              <span className="text-primary font-extrabold">#{orderInfo.id}</span>
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
                <span className="text-primary font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Link to="/" className="flex-1 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold py-3 rounded-sm transition-colors text-center focus:outline-none">
              Tiếp tục mua sắm
            </Link>
            <Link to="/profile?tab=orders" className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-sm transition-colors text-center shadow-xs focus:outline-none">
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
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-xs md:text-sm font-bold transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span>Quay lại giỏ hàng</span>
        </Link>
      </div>

      <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4 md:mb-6">Thanh toán đơn hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Checkout Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-sm p-4 md:p-6 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col gap-4.5">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2.5">
            <Truck size={16} className="text-primary" />
            <span>Địa chỉ nhận hàng BMart</span>
          </h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-[11px] text-gray-550 flex items-center gap-1.5 font-bold">
              <Phone size={13} />
              <span>Số điện thoại liên hệ</span>
            </label>
            <input 
              type="tel" 
              id="phone" 
              className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-primary"
              placeholder="Nhập số điện thoại người nhận..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="address" className="text-[11px] text-gray-550 flex items-center gap-1.5 font-bold">
                <MapPin size={13} />
                <span>Địa chỉ giao nhận chi tiết</span>
              </label>
              
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-[10px] md:text-xs font-bold text-primary bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100/70 font-bold px-2.5 py-1.5 rounded-sm border border-primary/10 flex items-center gap-1 transition-all focus:outline-none"
              >
                📍 {showMap ? "Ẩn bản đồ" : "Chọn từ Bản đồ / Định vị GPS"}
              </button>
            </div>
            
            <textarea 
              id="address" 
              className="text-xs px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-primary resize-y"
              placeholder="Ví dụ: Số 12, Ngõ 45, Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội..."
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />

            {showMap && (
              <div className="border border-gray-150 dark:border-gray-700 rounded-sm p-3 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-2.5 animate-fade-in mt-1">
                {/* Search Bar for Map */}
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Tìm địa điểm trên bản đồ (ví dụ: Nguyễn Trãi, Hà Nội)..."
                    value={mapSearch}
                    onChange={(e) => setMapSearch(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-900 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleMapSearch(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    disabled={mapLoading}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 rounded-sm focus:outline-none flex-shrink-0"
                  >
                    {mapLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>

                {/* Map Container */}
                <div className="relative w-full h-[280px] rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-800">
                  <div id="checkout-map" className="w-full h-full z-10" />
                  
                  {mapLoading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 italic">
                  * Hướng dẫn: Click chuột lên vị trí bất kỳ trên bản đồ hoặc kéo marker để chọn vị trí. Hệ thống sẽ tự động điền địa chỉ vào ô bên trên.
                </span>
              </div>
            )}
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
              className="text-xs px-3.5 py-2.5 border border-gray-100 dark:border-gray-800 rounded-sm bg-gray-50 dark:bg-gray-900/50 text-gray-400 font-bold tracking-wider"
              value={voucherCode ? voucherCode : 'Không có voucher nào được áp dụng từ giỏ hàng'}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-sm transition-all text-xs flex items-center justify-center gap-2 shadow-xs mt-3 focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Đang thực hiện giao dịch...' : 'Xác nhận Đặt hàng ngay'}
          </button>
        </form>

        {/* Mini Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-sm p-4 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col gap-3.5 self-start">
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
            <span className="text-primary text-base font-extrabold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
