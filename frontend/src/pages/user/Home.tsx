import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { Product, Category } from '../../types';
import { useWishlistStore } from '../../store/useWishlistStore';
import { CartContext } from '../../context/CartContext';
import { 
  Heart, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Percent, 
  Truck, 
  Award, 
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Star,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { showToast } from '../../services/toast';

const Home = () => {
  const navigate = useNavigate();
  const { fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'NEWEST' | 'BEST_SELLER'>('RECOMMENDED');

  // Slider Banner state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { 
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80", 
      title: "Siêu Sale Công Nghệ 2025", 
      tag: "XU HƯỚNG CÔNG NGHỆ",
      desc: "Giảm sâu đến 50% toàn bộ thiết bị thông minh. Miễn phí vận chuyển toàn quốc không giới hạn.",
      ctaPrimary: "Mua Ngay",
      ctaSecondary: "Tìm Hiểu Thêm"
    },
    { 
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80", 
      title: "Phong Cách Mới Đón Đầu", 
      tag: "THỜI TRANG & PHỤ KIỆN",
      desc: "Bộ sưu tập Hè mới nhất cùng Voucher độc quyền giảm thêm 15% cho thành viên mới.",
      ctaPrimary: "Săn Deal",
      ctaSecondary: "Xem Bộ Sưu Tập"
    },
    { 
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80", 
      title: "Vũ Trụ Gaming Đỉnh Cao", 
      tag: "GAMING GEARS",
      desc: "Nâng cấp góc chiến game của bạn. Trả góp 0% lãi suất cùng bộ quà tặng trị giá tới 3 triệu đồng.",
      ctaPrimary: "Săn Quà",
      ctaSecondary: "Góc Cảm Hứng"
    }
  ];

  // Countdown timer state for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 0 });
  const productSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchWishlist();

    // Auto slide timer
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);

    // Flash sale countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 3, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        showToast("Đã xóa khỏi danh sách yêu thích!", "success");
      } else {
        await addToWishlist(productId);
        showToast("Đã thêm vào danh sách yêu thích!", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Vui lòng đăng nhập để sử dụng tính năng này.", "error");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await addToCart(productId, 1);
      if (result.success) {
        showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
        // Dispatch event so that Navbar updates immediately
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        showToast(result.message, "error");
      }
    } catch (err) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", "error");
    }
  };

  const getFilteredProducts = () => {
    if (activeTab === 'NEWEST') {
      return [...products].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    if (activeTab === 'BEST_SELLER') {
      return [...products].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    }
    return products;
  };

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderStars = (rating?: number) => {
    const stars = [];
    const filledStars = Math.round(rating || 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={11} 
          className={i <= filledStars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-zinc-700'} 
        />
      );
    }
    return stars;
  };

  const flashSaleProducts = products.filter(p => p.isFlashSale || p.discountPrice !== null).slice(0, 6);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* === 1. HERO BANNER SECTION (Full Width & Premium 500px Height) === */}
      <div className="relative h-[240px] sm:h-[380px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group select-none">
        
        {/* Banner slides wrapper */}
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover brightness-95 dark:brightness-75 transition-all duration-700"
              />
              
              {/* Overlay Premium Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex flex-col justify-center px-8 sm:px-16 md:px-24 text-white">
                <span className="text-[10px] md:text-xs tracking-[0.25em] font-black text-yellow-400 uppercase mb-2 md:mb-3 animate-pulse">
                  {slide.tag}
                </span>
                <h1 className="text-xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-5 max-w-lg leading-tight md:leading-[1.1] drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-200/90 max-w-md mb-6 md:mb-8 line-clamp-2 leading-relaxed drop-shadow-xs font-semibold">
                  {slide.desc}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <button 
                    onClick={() => navigate('/search?categoryId=all')}
                    className="bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] hover:from-[#ee4d2d]/95 hover:to-[#ff7337]/95 text-white font-extrabold text-xs md:text-sm px-6 md:px-8 py-3 rounded-2xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
                  >
                    {slide.ctaPrimary}
                  </button>
                  <button 
                    onClick={scrollToProducts}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-extrabold text-xs md:text-sm px-6 md:px-8 py-3 rounded-2xl transition-all border border-white/20 active:scale-95"
                  >
                    {slide.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hidden group-hover:block transition-all focus:outline-none"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hidden group-hover:block transition-all focus:outline-none"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all rounded-full ${idx === currentSlide ? 'bg-yellow-400 w-7' : 'bg-white/40 w-2'}`}
            />
          ))}
        </div>
      </div>

      {/* === 2. CAM KẾT DỊCH VỤ (Shopee 2025 Value Proposition) === */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center md:text-left shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-zinc-850">
        <div className="flex flex-col md:flex-row items-center gap-4 px-2">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-[#ee4d2d] flex items-center justify-center flex-shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200">Giao Hàng Siêu Tốc 2H</h4>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-semibold">Nhận hàng trong vòng 2 giờ cho khu vực nội thành</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 px-2 border-y sm:border-y-0 sm:border-x border-gray-100 dark:border-zinc-800 py-4 sm:py-0">
          <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200">Cam Kết Chính Hãng 100%</h4>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-semibold">Đền bù gấp đôi nếu phát hiện hàng giả, hàng nhái</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 px-2">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Award size={22} />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200">Hỗ Trợ Đổi Trả Dễ Dàng</h4>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-semibold">Đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng</p>
          </div>
        </div>
      </div>

      {/* === 3. QUICK ACCESS MENUS === */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 md:p-5 grid grid-cols-3 sm:grid-cols-6 gap-4 text-center shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-zinc-850">
        <button onClick={() => navigate('/search?flashSale=true')} className="flex flex-col items-center gap-2 group focus:outline-none">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/25 flex items-center justify-center text-[#ee4d2d] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-orange-500/5">
            <Flame size={22} className="fill-orange-100 dark:fill-orange-950/20" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Khuyến Mãi Hot</span>
        </button>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-950/25 flex items-center justify-center text-green-600 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-green-500/5">
            <Percent size={22} />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Mã Giảm Giá</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/25 flex items-center justify-center text-blue-600 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-blue-500/5">
            <Truck size={22} />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Free Ship Xtra</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/25 flex items-center justify-center text-purple-600 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-purple-500/5">
            <Award size={22} />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Hàng Thương Hiệu</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-yellow-50 dark:bg-yellow-950/25 flex items-center justify-center text-yellow-600 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-yellow-500/5">
            <Sparkles size={22} className="fill-yellow-100 dark:fill-yellow-950/20" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Shopee Xu</span>
        </Link>
        <button onClick={() => navigate('/profile?tab=orders')} className="flex flex-col items-center gap-2 group focus:outline-none">
          <div className="h-12 w-12 rounded-2xl bg-pink-50 dark:bg-pink-950/25 flex items-center justify-center text-pink-600 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 shadow-md shadow-pink-500/5">
            <RefreshCw size={22} />
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300">Đơn Hàng Gần Đây</span>
        </button>
      </div>

      {/* === 4. PRODUCT CATEGORIES (Bo góc 16px, Hover lift, Micro-animations) === */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-zinc-850">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 bg-[#ee4d2d] rounded-full" />
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Danh Mục Sản Phẩm</h3>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/search?categoryId=${cat.id}`)}
              className="bg-gray-50 dark:bg-zinc-800/20 p-4 border border-gray-100/50 dark:border-zinc-800 rounded-2xl hover:border-shopee/40 dark:hover:border-shopee/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-3.5 focus:outline-none"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-orange-100/60 to-orange-200/40 dark:from-orange-950/30 dark:to-orange-900/10 text-shopee flex items-center justify-center font-black text-sm md:text-lg select-none shadow-inner">
                {cat.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] md:text-xs font-black text-gray-700 dark:text-gray-300 line-clamp-1 text-center select-none">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === 5. FLASH SALE SECTION (Countdown timer, progress bar, high interaction) === */}
      {flashSaleProducts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden border border-red-500/10">
          
          {/* Header Flash Sale */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/5 px-5 md:px-6 py-4 flex justify-between items-center flex-wrap gap-4 border-b border-red-100/60 dark:border-red-950/30">
            <div className="flex items-center gap-3.5">
              <span className="text-lg md:text-2xl font-black text-[#ee4d2d] flex items-center gap-1.5 italic tracking-wide">
                <Flame className="fill-shopee animate-bounce" size={24} />
                FLASH SALE
              </span>
              
              {/* Countdown panel */}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="bg-zinc-900 text-white text-[11px] md:text-xs font-black px-2 py-1.5 rounded-lg shadow-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="font-black text-[#ee4d2d] text-sm">:</span>
                <span className="bg-zinc-900 text-white text-[11px] md:text-xs font-black px-2 py-1.5 rounded-lg shadow-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="font-black text-[#ee4d2d] text-sm">:</span>
                <span className="bg-zinc-900 text-white text-[11px] md:text-xs font-black px-2 py-1.5 rounded-lg shadow-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/search?flashSale=true')} 
              className="text-xs text-[#ee4d2d] hover:text-shopee-hover font-black flex items-center gap-1 hover:translate-x-0.5 transition-transform"
            >
              <span>Xem Tất Cả</span>
              <ArrowRight size={13} />
            </button>
          </div>
          
          {/* Products Grid */}
          <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {flashSaleProducts.map(p => {
              const activePrice = p.discountPrice !== null ? p.discountPrice : p.price;
              const discountPercent = p.discountPrice !== null ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 25;
              const soldPercentage = Math.min(100, Math.round(((p.soldQuantity || 0) / (p.quantity + (p.soldQuantity || 0) || 1)) * 100));

              return (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="group cursor-pointer bg-white dark:bg-zinc-850 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:shadow-2xl hover:border-shopee/40 dark:hover:border-shopee/40 transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-zinc-800/40 flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-zinc-800/70">
                    {p.imageUrl ? (
                      <img 
                        src={getProductImageUrl(p.imageUrl)} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className="no-image-placeholder absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-zinc-800"
                      style={{ display: p.imageUrl ? 'none' : 'flex' }}
                    >
                      <Sparkles size={20} />
                      <span className="text-[9px] mt-1 font-semibold">Hot Deal</span>
                    </div>

                    {/* Discount Tag */}
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-[#ee4d2d] to-[#ff7337] text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-bl-2xl shadow-md">
                      -{discountPercent}%
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 flex flex-col gap-2 flex-grow">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-shopee transition-colors">{p.name}</h4>
                    
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs md:text-sm font-extrabold text-shopee">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                      </span>
                    </div>

                    {/* Progress Indicator for Sold count */}
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-red-100 dark:bg-red-950/20 h-4 rounded-full overflow-hidden relative flex items-center justify-center shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] h-full absolute left-0 top-0 transition-all duration-700 rounded-full" 
                          style={{ width: `${soldPercentage}%` }}
                        />
                        <span className="text-[8px] md:text-[9px] text-white dark:text-gray-100 font-black z-10 uppercase tracking-wider">
                          {p.soldQuantity && p.soldQuantity > 0 ? `Đã bán ${p.soldQuantity}` : "Vừa mở bán"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === 6. MAIN PRODUCT DISPLAY TABS === */}
      <div className="flex flex-col gap-5" ref={productSectionRef}>
        
        {/* Tabs selector */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-1.5 flex gap-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-zinc-850 overflow-x-auto select-none">
          <button 
            onClick={() => setActiveTab('RECOMMENDED')}
            className={`px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase transition-all duration-200 whitespace-nowrap ${
              activeTab === 'RECOMMENDED' 
                ? 'bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white shadow-lg shadow-orange-500/15' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
            }`}
          >
            🔥 Gợi Ý Hôm Nay
          </button>
          <button 
            onClick={() => setActiveTab('NEWEST')}
            className={`px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase transition-all duration-200 whitespace-nowrap ${
              activeTab === 'NEWEST' 
                ? 'bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white shadow-lg shadow-orange-500/15' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
            }`}
          >
            ✨ Hàng Mới Về
          </button>
          <button 
            onClick={() => setActiveTab('BEST_SELLER')}
            className={`px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase transition-all duration-200 whitespace-nowrap ${
              activeTab === 'BEST_SELLER' 
                ? 'bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white shadow-lg shadow-orange-500/15' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
            }`}
          >
            📈 Bán Chạy Nhất
          </button>
        </div>

        {/* Dynamic product list */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-50 dark:border-zinc-800 flex flex-col gap-3.5 animate-pulse shadow-sm">
                <div className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-lg w-1/2" />
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-lg w-full mt-2" />
              </div>
            ))}
          </div>
        ) : getFilteredProducts().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getFilteredProducts().map(product => {
              const activePrice = product.discountPrice !== null ? product.discountPrice : product.price;
              const hasDiscount = product.discountPrice !== null;
              const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-850 hover:border-shopee/40 dark:hover:border-shopee/40 hover:shadow-2xl transition-all duration-300 relative flex flex-col h-full hover:-translate-y-1.5"
                >
                  
                  {/* Image container */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-zinc-800/20 flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-zinc-850">
                    {product.imageUrl ? (
                      <img 
                        src={getProductImageUrl(product.imageUrl.split(';')[0])} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className="no-image-placeholder absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-zinc-800"
                      style={{ display: product.imageUrl ? 'none' : 'flex' }}
                    >
                      <ShoppingCart size={22} />
                      <span className="text-[10px] mt-1.5 font-bold">Chưa có ảnh</span>
                    </div>

                    {/* "Yêu thích" Orange Badge (Top-Left) */}
                    {product.soldQuantity && product.soldQuantity > 10 && (
                      <div className="absolute top-2.5 left-2.5 bg-[#ee4d2d] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md">
                        Yêu thích
                      </div>
                    )}

                    {/* Discount Tag (Top-Right) */}
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#ee4d2d] to-[#ff7337] text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-bl-2xl shadow-md">
                        -{discountPercent}%
                      </div>
                    )}

                    {/* Hover Overlay Button "Add to Cart" */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                      <button 
                        onClick={(e) => handleAddToCart(e, product.id)}
                        className="w-full bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white py-2 rounded-xl text-xs font-black shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/10"
                      >
                        <ShoppingCart size={13} />
                        <span>Thêm giỏ hàng</span>
                      </button>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-3 flex flex-col gap-2 flex-grow">
                    <span className="text-[9px] text-[#ff7337] font-black uppercase tracking-wider">{product.categoryName}</span>
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 h-8 leading-4 group-hover:text-shopee transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    
                    {/* Rating stars & sold */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {renderStars(5)}
                      </div>
                      <span className="text-[9px] text-gray-400 font-semibold">({product.soldQuantity || 0})</span>
                    </div>

                    <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-gray-50 dark:border-zinc-850">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xs md:text-sm font-black text-shopee">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[9px] text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-505 font-bold">
                          Đã bán {product.soldQuantity || 0}
                        </span>
                        
                        {/* Wishlist toggle button */}
                        <button 
                          onClick={(e) => handleWishlistToggle(e, product.id)}
                          className={`p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none transition-colors ${
                            isInWishlist(product.id) ? 'text-red-500' : 'text-gray-450 dark:text-gray-500'
                          }`}
                          title={isInWishlist(product.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                          <Heart size={13} className={isInWishlist(product.id) ? 'fill-current text-red-500' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-16 text-center text-gray-400 shadow-sm border border-gray-150 dark:border-zinc-850">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-xs font-bold">Không tìm thấy sản phẩm nào phù hợp</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
