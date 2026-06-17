import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Home,
  History,
  Compass,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { showToast } from '../services/toast';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuggestionsMobile, setShowSuggestionsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionsRefMobile = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Hot keywords
  const hotKeywords = ["Điện thoại", "Laptop", "Mỹ phẩm", "Áo khoác", "Giày thể thao", "Túi xách"];

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCartCount();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('bmart_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Listen to scroll to update header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    const history = [...searchHistory];
    const index = history.indexOf(query.trim());
    if (index > -1) {
      history.splice(index, 1);
    }
    history.unshift(query.trim());
    const newHistory = history.slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem('bmart_search_history', JSON.stringify(newHistory));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery.trim());
      setShowSuggestions(false);
      setShowSuggestionsMobile(false);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    saveSearchToHistory(keyword);
    setShowSuggestions(false);
    setShowSuggestionsMobile(false);
    navigate(`/search?query=${encodeURIComponent(keyword)}`);
  };

  const deleteHistoryItem = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((_, idx) => idx !== indexToDelete);
    setSearchHistory(newHistory);
    localStorage.setItem('bmart_search_history', JSON.stringify(newHistory));
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('bmart_search_history');
  };

  const handleLogout = () => {
    logout();
    showToast("Đăng xuất thành công!", "success");
    navigate('/login');
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#4f46e5]/95 backdrop-blur-md shadow-lg py-2' 
          : 'shopee-gradient py-3'
      } text-white`}>
        
        {/* === DESKTOP ONLY HEADER (>= 768px) === */}
        <div className="hidden md:block max-w-7xl mx-auto px-4">
          
          {/* Top Bar (Collapsed & Modern) */}
          <div className="relative z-40 flex justify-between items-center text-xs opacity-90 pb-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-4">
              {user && (user.role === 'SELLER') ? (
                <Link to="/seller" className="hover:text-amber-200 transition-colors font-semibold flex items-center gap-1">
                  <span>🏪</span> Kênh Người Bán
                </Link>
              ) : user && (user.role === 'ADMIN') ? (
                <Link to="/admin" className="hover:text-amber-200 transition-colors font-semibold flex items-center gap-1">
                  <span>⚙️</span> Kênh Quản Trị
                </Link>
              ) : (
                <Link to="/register" className="hover:text-amber-200 transition-colors">Trở thành Người bán</Link>
              )}
              <span className="opacity-30">|</span>
              <span className="cursor-default select-none">Kết nối</span>
              <div className="flex items-center gap-2">
                <a href="#" className="hover:text-amber-200 transition-colors font-bold">Fb</a>
                <a href="#" className="hover:text-amber-200 transition-colors font-bold">Insta</a>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Notification Popup */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => { if (user) setShowNotifications(!showNotifications); }}
                  className="flex items-center gap-1.5 hover:text-amber-200 relative focus:outline-none transition-colors"
                >
                  <Bell size={14} />
                  <span>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-[#4f46e5] text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white scale-90 shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3.5 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-gray-500 flex justify-between items-center text-xs">
                      <span>Thông báo mới nhất</span>
                      <span className="text-[10px] text-shopee">{unreadCount} tin chưa đọc</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-gray-400 text-xs">
                          Bạn chưa nhận được thông báo nào
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/20 cursor-pointer transition-colors ${!notif.isRead ? 'bg-orange-50/50' : ''}`}
                          >
                            <h4 className="font-bold text-xs text-gray-900 flex justify-between items-center">
                              {notif.title}
                              {!notif.isRead && <span className="h-2 w-2 bg-[#4f46e5] rounded-full" />}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{notif.content}</p>
                            <span className="text-[9px] text-gray-400 mt-1.5 block">{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link to="/profile?tab=orders" className="block text-center py-3 bg-gray-50 border-t border-gray-100 text-xs text-shopee hover:bg-gray-100 font-bold transition-colors">
                      Xem tất cả đơn hàng
                    </Link>
                  </div>
                )}
              </div>

              <Link to="#" className="flex items-center gap-1 hover:text-amber-200 transition-colors">
                <HelpCircle size={14} />
                <span>Hỗ trợ</span>
              </Link>

              {/* Dark mode switcher */}
              <button 
                onClick={toggleDarkMode}
                className="flex items-center gap-1 hover:text-amber-200 focus:outline-none transition-colors"
                title="Thay đổi màu giao diện"
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDarkMode ? "Giao diện sáng" : "Chủ đề tối"}</span>
              </button>

              {/* User profile dropdown */}
              {user ? (
                <div className="group relative flex items-center gap-1.5 cursor-pointer py-1">
                  <div className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center border border-white/40 text-white font-bold text-[10px] uppercase shadow-xs">
                    {user.username.charAt(0)}
                  </div>
                  <span className="font-bold hover:text-amber-200 transition-colors flex items-center gap-0.5">
                    {user.username}
                    <ChevronDown size={12} className="opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </span>

                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                    <div className="bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-150 py-2 animate-fade-in">
                      <Link to="/profile" className="px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold block transition-colors flex items-center gap-2">
                        <UserIcon size={14} className="text-gray-400" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link to="/profile?tab=orders" className="px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold block transition-colors flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span>Quản lý đơn mua</span>
                      </Link>
                      <Link to="/wishlist" className="px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold block transition-colors flex items-center gap-2 text-red-500 hover:text-red-600">
                        <Heart size={14} className="fill-current text-red-500" />
                        <span>Sản phẩm yêu thích</span>
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" className="px-4 py-2.5 hover:bg-orange-50 text-xs font-bold block transition-colors text-shopee border-t border-gray-100">
                          🛡️ Trang quản trị (Admin)
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-600 text-xs font-bold block transition-colors border-t border-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 font-bold">
                  <Link to="/register" className="hover:text-amber-200 transition-colors">Đăng ký</Link>
                  <span className="opacity-30">|</span>
                  <Link to="/login" className="hover:text-amber-200 transition-colors">Đăng nhập</Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Search Header */}
          <div className="flex justify-between items-center gap-8 py-1.5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 select-none hover:scale-[1.02] transition-transform duration-250">
              <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <ShoppingCart className="h-6 w-6 text-[#4f46e5] fill-[#4f46e5]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white italic drop-shadow-md">BMart</span>
            </Link>

            {/* Search Bar with History Dropdown */}
            <div className="flex-1 max-w-3xl relative z-30" ref={suggestionsRef}>
              <form onSubmit={handleSearchSubmit} className="flex bg-white p-1 rounded-xl shadow-lg border border-orange-500/10 focus-within:ring-2 focus-within:ring-yellow-400/50 transition-all duration-200">
                <input 
                  type="text" 
                  placeholder="Hôm nay bạn muốn mua gì? Tìm kiếm sản phẩm, thương hiệu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-800 focus:outline-none placeholder:text-gray-400 font-medium"
                />
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:brightness-105 text-white px-7 py-2.5 rounded-lg transition-all flex items-center justify-center shadow-md font-bold"
                >
                  <Search size={18} />
                </button>
              </form>

              {/* Suggestions / History Popover */}
              {showSuggestions && (
                <div className="absolute w-full mt-2 bg-white border border-gray-150 rounded-2xl shadow-2xl text-gray-850 z-50 overflow-hidden animate-fade-in">
                  
                  {/* Mode 1: Search Query Suggestion */}
                  {searchQuery.trim() !== '' && suggestions.length > 0 && (
                    <div className="py-1">
                      {suggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-5 py-3.5 hover:bg-gray-50 cursor-pointer text-xs font-semibold border-b border-gray-50 flex items-center justify-between transition-colors text-gray-700"
                        >
                          <span className="flex items-center gap-2.5">
                            <Search size={13} className="text-gray-400" />
                            {item}
                          </span>
                          <span className="text-[10px] text-gray-400">Tìm kiếm gợi ý</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mode 2: Empty Query - Show Search History */}
                  {searchQuery.trim() === '' && (
                    <div className="p-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                        <span className="flex items-center gap-1.5"><History size={13} /> Lịch sử tìm kiếm</span>
                        {searchHistory.length > 0 && (
                          <button onClick={clearAllHistory} className="text-shopee hover:underline normal-case">Xóa tất cả</button>
                        )}
                      </div>
                      
                      {searchHistory.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 font-medium">
                          Chưa có lịch sử tìm kiếm nào
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2.5 py-1">
                          {searchHistory.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => handleSuggestionClick(item)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 group/item"
                            >
                              <span>{item}</span>
                              <button 
                                onClick={(e) => deleteHistoryItem(e, idx)}
                                className="text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-300/40 p-0.5"
                                title="Xóa lịch sử này"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hot Keywords list */}
              <div className="flex gap-4.5 mt-2 text-[11px] text-white/90 overflow-hidden h-4 font-semibold px-1">
                {hotKeywords.map((keyword, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleSuggestionClick(keyword)}
                    className="hover:text-yellow-200 hover:underline transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Icon */}
            <div className="flex-shrink-0 relative group pr-2">
              <Link to="/cart" className="relative p-2.5 block hover:scale-105 transition-transform">
                <ShoppingCart size={28} className="text-white hover:text-amber-100" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-yellow-400 text-[#4f46e5] text-[10px] font-black rounded-full h-5.5 w-5.5 flex items-center justify-center border-2 border-[#4f46e5] shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* === MOBILE ONLY HEADER (< 768px) === */}
        <div className="flex md:hidden flex-col px-4 py-1 gap-2.5">
          {/* Row 1: Hamburger Menu | Logo | Theme | Cart */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1 text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            
            <Link to="/" className="flex items-center gap-1.5 select-none">
              <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <ShoppingCart className="h-4 w-4 text-[#4f46e5] fill-[#4f46e5]" />
              </div>
              <span className="text-lg font-black tracking-tight italic">BMart</span>
            </Link>
            
            <div className="flex items-center gap-1">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
                title="Thay đổi màu nền"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <Link to="/cart" className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-yellow-400 text-[#4f46e5] text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-[#4f46e5] shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Row 2: Search Input */}
          <div className="w-full relative" ref={suggestionsRefMobile}>
            <form onSubmit={handleSearchSubmit} className="flex bg-white p-1 rounded-xl shadow-md border border-orange-500/10 focus-within:ring-2 focus-within:ring-yellow-400/40">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestionsMobile(true)}
                className="flex-1 px-3 py-1.5 text-xs text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-semibold"
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-4 py-1.5 rounded-lg transition-all flex items-center justify-center focus:outline-none"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Suggestions/History popup */}
            {showSuggestionsMobile && (
              <div className="absolute w-full mt-1.5 bg-white border border-gray-150 rounded-2xl shadow-xl text-gray-850 z-50 overflow-hidden">
                {searchQuery.trim() !== '' && suggestions.length > 0 && (
                  <div className="py-1">
                    {suggestions.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-xs font-bold border-b border-gray-50 flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <Search size={11} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim() === '' && (
                  <div className="p-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase mb-2">
                      <span>Lịch sử tìm kiếm</span>
                      {searchHistory.length > 0 && (
                        <button onClick={clearAllHistory} className="text-shopee normal-case">Xóa</button>
                      )}
                    </div>
                    {searchHistory.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-400">Không có lịch sử tìm kiếm</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleSuggestionClick(item)}
                            className="bg-gray-100 rounded-full px-3 py-1.5 text-[10px] font-semibold text-gray-700 flex items-center gap-1.5"
                          >
                            <span>{item}</span>
                            <button onClick={(e) => deleteHistoryItem(e, idx)} className="text-gray-400">
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* === MOBILE SIDE DRAWER === */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 shadow-2xl transition-transform duration-300 transform translate-x-0 z-10">
            
            {/* Header */}
            <div className="shopee-gradient p-5 text-white flex flex-col gap-3 relative">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={18} />
              </button>
              
              {user ? (
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-11 w-11 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 text-white text-base font-bold uppercase shadow-sm">
                    {user.username.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide line-clamp-1">{user.username}</h3>
                    <p className="text-[10px] text-white/80 uppercase tracking-wider font-bold">{user.role}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4 pr-6">
                  <p className="text-xs font-bold text-white/95">Chào mừng bạn đến với BMart!</p>
                  <div className="flex gap-2 mt-1">
                    <Link 
                      to="/login" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 text-center py-1.5 bg-white text-[#4f46e5] font-bold rounded-lg text-xs shadow-xs"
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 text-center py-1.5 bg-white/25 text-white font-bold rounded-lg text-xs border border-white/25"
                    >
                      Đăng ký
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Menu options */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh mục chính</div>
              <nav className="space-y-1 px-2">
                <Link 
                  to="/" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
                >
                  <Home size={16} className="text-gray-500" />
                  <span>Trang chủ</span>
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
                    >
                      <UserIcon size={16} className="text-gray-500" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link 
                      to="/profile?tab=orders" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
                    >
                      <Package size={16} className="text-gray-500" />
                      <span>Quản lý đơn mua</span>
                    </Link>
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold transition-colors text-red-500"
                    >
                      <Heart size={16} className="fill-current text-red-500" />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                  </>
                )}
              </nav>

              <hr className="my-4 border-gray-100 dark:border-zinc-800" />
              
              <div className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cài đặt & Giao diện</div>
              <nav className="space-y-1 px-2">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold text-left transition-colors"
                >
                  {isDarkMode ? (
                    <>
                      <Sun size={16} className="text-yellow-500" />
                      <span>Giao diện sáng</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} className="text-indigo-400" />
                      <span>Chủ đề tối</span>
                    </>
                  )}
                </button>
              </nav>
            </div>

            {/* Bottom buttons */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2 bg-gray-50 dark:bg-zinc-900/50">
              {user && user.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center py-2 bg-orange-100 dark:bg-orange-950/40 text-[#4f46e5] dark:text-orange-400 font-bold rounded-lg text-xs shadow-xs"
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition-colors border border-red-100/30"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MOBILE BOTTOM NAVIGATION BAR (BMart Style) === */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 py-1.5 px-4 flex justify-between items-center md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
            location.pathname === '/' ? 'text-[#4f46e5] scale-105' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Home size={18} className={location.pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-black tracking-wide">Trang chủ</span>
        </Link>

        <Link 
          to="/search?categoryId=all" 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
            location.pathname === '/search' ? 'text-[#4f46e5] scale-105' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Compass size={18} className={location.pathname === '/search' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-black tracking-wide">Khám phá</span>
        </Link>

        <Link 
          to="/cart" 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 relative transition-all ${
            location.pathname === '/cart' ? 'text-[#4f46e5] scale-105' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <ShoppingCart size={18} className={location.pathname === '/cart' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-4 bg-yellow-400 text-[#4f46e5] text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-black tracking-wide">Giỏ hàng</span>
        </Link>

        <Link 
          to="/wishlist" 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
            location.pathname === '/wishlist' ? 'text-[#4f46e5] scale-105' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Heart size={18} className={location.pathname === '/wishlist' ? 'stroke-[2.5px] fill-current text-red-500' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-black tracking-wide">Yêu thích</span>
        </Link>

        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
            location.pathname === '/profile' ? 'text-[#4f46e5] scale-105' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <UserIcon size={18} className={location.pathname === '/profile' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
          <span className="text-[9px] font-black tracking-wide">Tài khoản</span>
        </Link>
      </div>
    </>
  );
};

export default Navbar;
