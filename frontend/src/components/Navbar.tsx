import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useThemeStore } from '../store/useThemeStore';
import { useNotificationStore } from '../store/useNotificationStore';
import API from '../services/api';
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  HelpCircle, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Package,
  Heart
} from 'lucide-react';
import { showToast } from '../services/toast';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Hot keywords
  const hotKeywords = ["Điện thoại", "Laptop", "Mỹ phẩm", "Áo khoác", "Giày thể thao", "Túi xách"];

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCartCount();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await API.get('/cart');
      const items = response.data?.cartItems || response.data?.items || [];
      const totalCount = items.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
      setCartCount(totalCount);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    }
  };

  // Fetch suggestions when query changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await API.get(`/products/search/suggest?query=${encodeURIComponent(searchQuery)}`);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
      }
    };

    const delayDebounce = setTimeout(getSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    logout();
    showToast("Đăng xuất thành công!", "success");
    navigate('/login');
  };

  return (
    <header className="shopee-gradient text-white sticky top-0 z-50 shadow-md">
      {/* 1. Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <Link to="#" className="hover:text-gray-200">Kênh Người Bán</Link>
          <span className="opacity-30">|</span>
          <Link to="#" className="hover:text-gray-200">Tải ứng dụng</Link>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <span>Kết nối</span>
            <Link to="#" className="hover:text-gray-200 font-bold">Facebook</Link>
            <Link to="#" className="hover:text-gray-200 font-bold">Instagram</Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Notification Button & Popup */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { if (user) setShowNotifications(!showNotifications); }}
              className="flex items-center gap-1 hover:text-gray-200 relative focus:outline-none"
            >
              <Bell size={14} />
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-shopee text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-shopee scale-90">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-medium text-gray-500 flex justify-between items-center">
                  <span>Thông báo mới nhận</span>
                  <span className="text-[10px] text-shopee">{unreadCount} chưa đọc</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-xs">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-orange-50/40' : ''}`}
                      >
                        <h4 className="font-semibold text-xs text-gray-900 flex justify-between items-center">
                          {notif.title}
                          {!notif.isRead && <span className="h-1.5 w-1.5 bg-shopee rounded-full" />}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{notif.content}</p>
                        <span className="text-[9px] text-gray-400 mt-1 block">{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    ))
                  )}
                </div>
                <Link to="/profile?tab=orders" className="block text-center py-2 bg-gray-50 border-t border-gray-100 text-xs text-shopee hover:bg-gray-100 font-semibold">
                  Xem tất cả đơn hàng
                </Link>
              </div>
            )}
          </div>

          <Link to="#" className="flex items-center gap-1 hover:text-gray-200">
            <HelpCircle size={14} />
            <span>Hỗ trợ</span>
          </Link>

          {/* Dark Mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-1 hover:text-gray-200 focus:outline-none"
            title="Đổi giao diện Sáng / Tối"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDarkMode ? "Giao diện sáng" : "Chủ đề tối"}</span>
          </button>

          {/* User Account Controls */}
          {user ? (
            <div className="group relative flex items-center gap-1.5 cursor-pointer py-1">
              <div className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold hover:text-gray-200">{user.username}</span>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-44 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1.5 hidden group-hover:block z-50 animate-fade-in">
                <Link to="/profile" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors flex items-center gap-2">
                  <UserIcon size={14} />
                  <span>Tài khoản của tôi</span>
                </Link>
                <Link to="/profile?tab=orders" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors flex items-center gap-2">
                  <Package size={14} />
                  <span>Đơn mua</span>
                </Link>
                <Link to="/wishlist" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors flex items-center gap-2 text-red-500">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                  <span>Sản phẩm yêu thích</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors font-bold text-shopee border-t border-gray-100">
                    Trang quản trị (Admin)
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-xs block transition-colors border-t border-gray-100 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 font-semibold">
              <Link to="/register" className="hover:text-gray-200">Đăng ký</Link>
              <span className="opacity-30">|</span>
              <Link to="/login" className="hover:text-gray-200">Đăng nhập</Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Search Header */}
      <div className="max-w-7xl mx-auto px-4 py-4.5 flex justify-between items-center gap-4 md:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 select-none">
          <ShoppingCart className="h-8 w-8 text-white fill-white" />
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white italic">ShopeeShop</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl relative" ref={suggestionsRef}>
          <form onSubmit={handleSearchSubmit} className="flex bg-white p-1 rounded-md shadow-sm border border-orange-600/10">
            <input 
              type="text" 
              placeholder="Săn deal hot ngay hôm nay..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-4 py-2 text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
            />
            <button 
              type="submit" 
              className="bg-shopee hover:bg-shopee-hover text-white px-6 py-2 rounded-sm transition-all flex items-center justify-center shadow-sm"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Autocomplete suggestions popup */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl text-gray-800 z-50 overflow-hidden">
              {suggestions.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-50 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">{item}</span>
                  <Search size={12} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {/* Hot Keywords list below search bar */}
          <div className="hidden md:flex gap-4.5 mt-1.5 text-[11px] text-white/95 overflow-hidden h-4">
            {hotKeywords.map((keyword, index) => (
              <button 
                key={index} 
                onClick={() => handleSuggestionClick(keyword)}
                className="hover:underline hover:text-white"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Icon & Badge */}
        <div className="flex-shrink-0 relative group pr-2">
          <Link to="/cart" className="relative p-2 block hover:scale-105 transition-transform">
            <ShoppingCart size={28} className="text-white hover:text-gray-100" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-shopee text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border border-shopee shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
