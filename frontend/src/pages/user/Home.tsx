import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { Product, Category } from '../../types';
import { useWishlistStore } from '../../store/useWishlistStore';
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Percent, 
  Truck, 
  Award, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { showToast } from '../../services/toast';

const Home = () => {
  const navigate = useNavigate();
  const { fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'NEWEST' | 'BEST_SELLER'>('RECOMMENDED');

  // Slider Banner state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80", title: "Siêu Sale Công Nghệ 6.6", desc: "Giảm đến 50% - Freeship toàn quốc" },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", title: "Đón Đầu Xu Hướng Laptop Mới", desc: "Trả góp 0% - Tặng kèm bộ phụ kiện trị giá 2 triệu" },
    { image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80", title: "Phụ Kiện Gaming Đỉnh Cao", desc: "Đồng giá từ 99k - Săn voucher giảm thêm 15%" }
  ];

  // Countdown timer state for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 0 });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchWishlist();

    // Auto slide timer
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

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
          // Reset to 3 hours countdown
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

  const getFilteredProducts = () => {
    if (activeTab === 'NEWEST') {
      return [...products].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    if (activeTab === 'BEST_SELLER') {
      return [...products].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    }
    return products; // Default Recommended / list
  };

  const flashSaleProducts = products.filter(p => p.isFlashSale || p.discountPrice !== null).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* 1. Banner Slider Section */}
      <div className="relative h-[220px] md:h-[350px] w-full rounded-lg overflow-hidden shadow-sm group">
        <div 
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
                <h2 className="text-xl md:text-4xl font-extrabold mb-2 drop-shadow-sm">{slide.title}</h2>
                <p className="text-xs md:text-lg text-white/90 drop-shadow-sm">{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Banner Controls */}
        <button 
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden group-hover:block transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full hidden group-hover:block transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-shopee w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Quick Menus (Shopee style) */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 grid grid-cols-3 md:grid-cols-6 gap-4 text-center shadow-sm">
        <button onClick={() => navigate('/search?flashSale=true')} className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-shopee group-hover:scale-105 transition-transform">
            <Flame size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Khung Giờ Flash Sale</span>
        </button>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform">
            <Percent size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mã Giảm Giá 20k</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
            <Truck size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Miễn Phí Vận Chuyển</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
            <Award size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hàng Hiệu Outlet</span>
        </Link>
        <Link to="#" className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-yellow-100 dark:bg-yellow-950/50 flex items-center justify-center text-yellow-600 group-hover:scale-105 transition-transform">
            <Sparkles size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Xu Shopee Săn Thưởng</span>
        </Link>
        <button onClick={() => navigate('/profile?tab=orders')} className="flex flex-col items-center gap-2 group">
          <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 group-hover:scale-105 transition-transform">
            <RefreshCw size={24} />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Đổi Trả Dễ Dàng</span>
        </button>
      </div>

      {/* 3. Categories Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Danh mục sản phẩm</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/search?categoryId=${cat.id}`)}
              className="bg-gray-50 dark:bg-zinc-800/40 p-4 border border-gray-100 dark:border-zinc-800 rounded-lg hover:border-shopee dark:hover:border-shopee hover:shadow-sm transition-all flex flex-col items-center gap-2.5"
            >
              <div className="h-12 w-12 rounded-full bg-orange-100/50 dark:bg-orange-950/20 text-shopee flex items-center justify-center font-bold text-lg select-none">
                {cat.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-1 text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-red-500/10">
          <div className="bg-red-50 dark:bg-red-950/30 px-6 py-4 flex justify-between items-center flex-wrap gap-4 border-b border-red-100 dark:border-red-950/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-shopee flex items-center gap-1 italic">
                <Flame className="fill-shopee" size={24} />
                FLASH SALE
              </span>
              {/* Countdown clock */}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="bg-black text-white text-xs font-extrabold px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="font-bold text-shopee">:</span>
                <span className="bg-black text-white text-xs font-extrabold px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="font-bold text-shopee">:</span>
                <span className="bg-black text-white text-xs font-extrabold px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <button onClick={() => navigate('/search?flashSale=true')} className="text-xs text-shopee hover:text-shopee-hover font-semibold">
              Xem tất cả &gt;
            </button>
          </div>
          
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {flashSaleProducts.map(p => {
              const activePrice = p.discountPrice !== null ? p.discountPrice : p.price;
              const discountPercent = p.discountPrice !== null ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 25;
              const soldPercentage = Math.min(100, Math.round(((p.soldQuantity || 0) / (p.quantity + (p.soldQuantity || 0) || 1)) * 100));

              return (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="group cursor-pointer bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-700 hover:shadow-lg transition-all relative flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <img 
                        src={getProductImageUrl(p.imageUrl)} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <Sparkles size={24} />
                      <span className="text-[10px] mt-1 font-semibold">Deal Hot</span>
                    </div>

                    {/* Discount badge */}
                    <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-bl">
                      {discountPercent}% GIẢM
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 flex flex-col gap-2 flex-grow">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{p.name}</h4>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-shopee">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                      </span>
                    </div>

                    {/* Sold progress bar */}
                    <div className="mt-auto">
                      <div className="w-full bg-red-100 dark:bg-red-950/40 h-4 rounded-full overflow-hidden relative flex items-center justify-center">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-full absolute left-0 top-0 transition-all duration-500" 
                          style={{ width: `${soldPercentage}%` }}
                        />
                        <span className="text-[9px] text-white font-extrabold z-10 drop-shadow-sm uppercase">
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

      {/* 5. Recommended Products Tabs */}
      <div className="flex flex-col gap-4">
        {/* Tab switcher */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-2 flex gap-2 shadow-sm border-b border-gray-100 dark:border-zinc-800 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('RECOMMENDED')}
            className={`px-5 py-3 rounded-lg text-xs font-extrabold uppercase transition-all whitespace-nowrap ${activeTab === 'RECOMMENDED' ? 'bg-shopee text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
          >
            Gợi ý hôm nay
          </button>
          <button 
            onClick={() => setActiveTab('NEWEST')}
            className={`px-5 py-3 rounded-lg text-xs font-extrabold uppercase transition-all whitespace-nowrap ${activeTab === 'NEWEST' ? 'bg-shopee text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
          >
            Hàng mới về
          </button>
          <button 
            onClick={() => setActiveTab('BEST_SELLER')}
            className={`px-5 py-3 rounded-lg text-xs font-extrabold uppercase transition-all whitespace-nowrap ${activeTab === 'BEST_SELLER' ? 'bg-shopee text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
          >
            Bán chạy nhất
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-100 dark:border-zinc-800 flex flex-col gap-3 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
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
                  className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 hover:border-shopee dark:hover:border-shopee hover:shadow-xl transition-all relative flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={getProductImageUrl(product.imageUrl)} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <ShoppingCart size={24} />
                      <span className="text-[10px] mt-1 font-semibold">Chưa có ảnh</span>
                    </div>

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-bl">
                        {discountPercent}% GIẢM
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex flex-col gap-2 flex-grow">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{product.categoryName}</span>
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 h-8 leading-4" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <div className="flex flex-col gap-1 mt-auto">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-shopee">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          Đã bán {product.soldQuantity || 0}
                        </span>
                        
                        {/* Wishlist toggle button */}
                        <button 
                          onClick={(e) => handleWishlistToggle(e, product.id)}
                          className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          <Heart size={14} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-16 text-center text-gray-400 shadow-sm">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
