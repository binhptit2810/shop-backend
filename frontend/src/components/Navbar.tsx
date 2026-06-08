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
  User as UserIcon, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Package,
  Heart,
  Home
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
  const [showSuggestionsMobile, setShowSuggestionsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionsRefMobile = useRef<HTMLDivElement>(null);
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
      if (suggestionsRefMobile.current && !suggestionsRefMobile.current.contains(e.target as Node)) {
        setShowSuggestionsMobile(false);
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
      setShowSuggestionsMobile(false);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    setShowSuggestionsMobile(false);
    navigate(`/search?query=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    logout();
    showToast("Đăng xuất thành công!", "success");
    navigate('/login');
  };

  return (
    <>
      <header className="shopee-gradient text-white sticky top-0 z-50 shadow-md w-full">
        {/* === DESKTOP ONLY HEADER (>= 768px) === */}
        <div className="hidden md:block">
          {/* Top Bar */}
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs border-b border-white/10">
            <div className="flex items-center gap-4">
              <Link to="#" className="hover:text-gray-200 transition-colors">Kênh Người Bán</Link>
              <span className="opacity-30">|</span>
              <Link to="#" className="hover:text-gray-200 transition-colors">Tải ứng dụng</Link>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1.5">
                <span>Kết nối</span>
                <Link to="#" className="hover:text-gray-200 font-bold transition-colors">Facebook</Link>
                <Link to="#" className="hover:text-gray-200 font-bold transition-colors">Instagram</Link>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Notification Button & Popup */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => { if (user) setShowNotifications(!showNotifications); }}
                  className="flex items-center gap-1.5 hover:text-gray-200 relative focus:outline-none transition-colors"
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
                    <Link to="/profile?tab=orders" className="block text-center py-2 bg-gray-50 border-t border-gray-100 text-xs text-shopee hover:bg-gray-100 font-semibold transition-colors">
                      Xem tất cả đơn hàng
                    </Link>
                  </div>
                )}
              </div>

              <Link to="#" className="flex items-center gap-1 hover:text-gray-200 transition-colors">
                <HelpCircle size={14} />
                <span>Hỗ trợ</span>
              </Link>

              {/* Dark Mode toggle */}
              <button 
                onClick={toggleDarkMode}
                className="flex items-center gap-1 hover:text-gray-200 focus:outline-none transition-colors"
                title="Đổi giao diện Sáng / Tối"
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDarkMode ? "Giao diện sáng" : "Chủ đề tối"}</span>
              </button>

              {/* User Account Controls */}
              {user ? (
                <div className="group relative flex items-center gap-1.5 cursor-pointer py-1">
                  <div className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white font-bold text-[10px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold hover:text-gray-200 transition-colors">{user.username}</span>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1.5 hidden group-hover:block z-50 animate-fade-in">
                    <Link to="/profile" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-500" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                    <Link to="/profile?tab=orders" className="px-4 py-2 hover:bg-gray-50 text-xs block transition-colors flex items-center gap-2">
                      <Package size={14} className="text-gray-500" />
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
                  <Link to="/register" className="hover:text-gray-200 transition-colors">Đăng ký</Link>
                  <span className="opacity-30">|</span>
                  <Link to="/login" className="hover:text-gray-200 transition-colors">Đăng nhập</Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Search Header */}
          <div className="max-w-7xl mx-auto px-4 py-4.5 flex justify-between items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 select-none hover:opacity-95 transition-opacity">
              <ShoppingCart className="h-8 w-8 text-white fill-white" />
              <span className="text-3xl font-extrabold tracking-tight text-white italic">ShopeeShop</span>
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
                  className="bg-shopee hover:bg-shopee-hover text-white px-6 py-2 rounded-sm transition-all flex items-center justify-center shadow-sm font-semibold"
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
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-50 flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-gray-700">{item}</span>
                      <Search size={12} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Hot Keywords */}
              <div className="flex gap-4.5 mt-1.5 text-[11px] text-white/95 overflow-hidden h-4">
                {hotKeywords.map((keyword, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleSuggestionClick(keyword)}
                    className="hover:underline hover:text-white transition-colors"
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
        </div>

        {/* === MOBILE ONLY HEADER (< 768px) === */}
        <div className="flex md:hidden flex-col px-3 py-2 gap-2">
          {/* Row 1: Hamburger Menu | Logo | Theme | Cart */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1 text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            
            <Link to="/" className="flex items-center gap-1 select-none">
              <ShoppingCart className="h-5 w-5 text-white fill-white" />
              <span className="text-lg font-black tracking-tight italic">ShopeeShop</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-1.5 text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                title="Đổi giao diện"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <Link to="/cart" className="relative p-1.5 text-white hover:bg-white/10 rounded-full transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-white text-shopee text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-shopee shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Row 2: Search Bar */}
          <div className="w-full relative" ref={suggestionsRefMobile}>
            <form onSubmit={handleSearchSubmit} className="flex bg-white p-1 rounded-md shadow-xs border border-orange-600/10">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestionsMobile(true)}
                className="flex-1 px-3 py-1 text-xs text-gray-800 focus:outline-none placeholder:text-gray-400"
              />
              <button 
                type="submit" 
                className="bg-shopee hover:bg-shopee-hover text-white px-4 py-1.5 rounded-xs transition-all flex items-center justify-center shadow-xs"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Suggestions */}
            {showSuggestionsMobile && suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg text-gray-800 z-50 overflow-hidden">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-50 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-700">{item}</span>
                    <Search size={12} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* === MOBILE SIDE DRAWER === */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 shadow-2xl transition-transform duration-300 transform translate-x-0 z-10">
            {/* Header: User Info / Welcome */}
            <div className="shopee-gradient p-5 text-white flex flex-col gap-3 relative">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full text-white transition-colors"
                aria-label="Đóng menu"
              >
                <X size={18} />
              </button>
              
              {user ? (
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 text-white text-lg font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide line-clamp-1">{user.username}</h3>
                    <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">{user.role}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4 pr-6">
                  <p className="text-xs font-semibold text-white/95">Chào mừng đến với ShopeeShop!</p>
                  <div className="flex gap-2 mt-1">
                    <Link 
                      to="/login" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 text-center py-1.5 bg-white text-shopee font-bold rounded text-xs shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 text-center py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded text-xs border border-white/20 transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Danh mục chính</div>
              <nav className="space-y-1 px-2">
                <Link 
                  to="/" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors"
                >
                  <Home size={18} className="text-gray-500 dark:text-gray-400" />
                  <span>Trang chủ</span>
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors"
                    >
                      <UserIcon size={18} className="text-gray-500 dark:text-gray-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link 
                      to="/profile?tab=orders" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors"
                    >
                      <Package size={18} className="text-gray-500 dark:text-gray-400" />
                      <span>Đơn mua của tôi</span>
                    </Link>
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors text-red-500 dark:text-red-400"
                    >
                      <Heart size={18} className="fill-current" />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                  </>
                )}
                <Link 
                  to="/cart" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors"
                >
                  <ShoppingCart size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="flex-1">Giỏ hàng</span>
                  {cartCount > 0 && (
                    <span className="bg-shopee text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                  )}
                </Link>
              </nav>

              <hr className="my-4 border-gray-100 dark:border-gray-900" />
              
              <div className="px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hỗ trợ & Giao diện</div>
              <nav className="space-y-1 px-2">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-left transition-colors"
                >
                  {isDarkMode ? (
                    <>
                      <Sun size={18} className="text-amber-500" />
                      <span>Chế độ sáng</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} className="text-indigo-400" />
                      <span>Chế độ tối</span>
                    </>
                  )}
                </button>
                <Link 
                  to="#" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold transition-colors"
                >
                  <HelpCircle size={18} className="text-gray-500 dark:text-gray-400" />
                  <span>Trung tâm trợ giúp</span>
                </Link>
              </nav>
            </div>

            {/* Footer / Admin & Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-900 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900/40">
              {user && user.role === 'ADMIN' && (
                <Link 
                  to="/admin/dashboard" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center py-2 bg-orange-100 dark:bg-orange-950/40 text-shopee dark:text-orange-400 font-bold rounded-lg text-xs shadow-xs hover:bg-orange-200/50 dark:hover:bg-orange-900/60 transition-colors"
                >
                  Trang quản trị (Admin)
                </Link>
              )}
              {user && (
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-lg text-xs transition-colors border border-red-100/50 dark:border-red-900/30"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
