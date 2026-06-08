import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API, { getProductImageUrl } from '../../services/api';
import { Product, Category } from '../../types';
import { useWishlistStore } from '../../store/useWishlistStore';
import { CartContext } from '../../context/CartContext';
import { showToast } from '../../services/toast';
import { 
  Search as SearchIcon, 
  Filter, 
  ShoppingCart, 
  Heart, 
  SlidersHorizontal,
  X, 
  Flame, 
  Award,
  Sparkles,
  RefreshCw,
  Grid
} from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract query parameters from URL
  const queryParam = searchParams.get('query') || '';
  const categoryIdParam = searchParams.get('categoryId') || '';
  const flashSaleParam = searchParams.get('flashSale') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortByParam = searchParams.get('sortBy') || 'newest';

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter inputs (synced with URL or local inputs before apply)
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Wishlist & Cart Context
  const { fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useContext(CartContext);

  // Load categories and wishlist on mount
  useEffect(() => {
    fetchCategories();
    fetchWishlist();
  }, []);

  // Update local inputs when URL params change
  useEffect(() => {
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Fetch products whenever search parameters change
  useEffect(() => {
    fetchProducts();
  }, [queryParam, categoryIdParam, minPriceParam, maxPriceParam, sortByParam]);

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
      // Build API request parameters
      const params: any = {
        page: 0,
        size: 100 // Load a generous list for client-side sorting/filtering fallbacks if needed
      };

      if (queryParam.trim()) {
        params.name = queryParam.trim();
      }
      if (categoryIdParam) {
        params.categoryId = parseInt(categoryIdParam);
      }
      if (minPriceParam) {
        params.minPrice = parseFloat(minPriceParam);
      }
      if (maxPriceParam) {
        params.maxPrice = parseFloat(maxPriceParam);
      }
      if (sortByParam) {
        params.sortBy = sortByParam;
      }

      const response = await API.get('/products/search', { params });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      showToast("Không thể tải danh sách sản phẩm. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Client side filtering for Flash Sale if needed
  const displayedProducts = flashSaleParam 
    ? products.filter(p => p.isFlashSale || p.discountPrice !== null)
    : products;

  // Update helper functions
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page if we had pagination
    setSearchParams(newParams);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) {
      newParams.set('minPrice', localMinPrice);
    } else {
      newParams.delete('minPrice');
    }
    if (localMaxPrice) {
      newParams.set('maxPrice', localMaxPrice);
    } else {
      newParams.delete('maxPrice');
    }
    setSearchParams(newParams);
    setIsMobileFilterOpen(false);
  };

  const handleClearAllFilters = () => {
    setSearchParams({});
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setIsMobileFilterOpen(false);
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

  const handleAddToCart = async (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(p.id, 1);
    if (res.success) {
      showToast(`Đã thêm ${p.name} vào giỏ hàng!`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-6 dark:text-gray-150">
      {/* 1. Header & Quick stats */}
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <SearchIcon size={22} className="text-shopee" />
            {queryParam ? `Kết quả tìm kiếm cho: "${queryParam}"` : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-[11px] md:text-xs text-gray-400 mt-0.5">
            Tìm thấy <span className="font-bold text-shopee">{displayedProducts.length}</span> sản phẩm phù hợp.
          </p>
        </div>
        
        {/* Mobile Filter toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs focus:outline-none"
          >
            <SlidersHorizontal size={14} className="text-shopee" />
            Bộ lọc & Tìm kiếm
          </button>
          
          {(categoryIdParam || flashSaleParam || minPriceParam || maxPriceParam) && (
            <button 
              onClick={handleClearAllFilters}
              className="py-2 px-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl text-xs font-bold focus:outline-none"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 items-start relative">
        {/* === DESKTOP SIDEBAR FILTER (>= 768px) === */}
        <aside className="hidden md:block w-60 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 shadow-xs flex-shrink-0 sticky top-24">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-zinc-800 pb-3 mb-4 uppercase tracking-wider">
            <Filter size={16} className="text-shopee" />
            Bộ lọc tìm kiếm
          </h2>

          {/* Categories Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Danh mục</h3>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button 
                onClick={() => updateFilter('categoryId', null)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-bold transition-all truncate block ${!categoryIdParam ? 'bg-orange-50 dark:bg-orange-950/30 text-shopee' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => updateFilter('categoryId', cat.id.toString())}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg font-bold transition-all truncate block ${categoryIdParam === cat.id.toString() ? 'bg-orange-50 dark:bg-orange-950/30 text-shopee' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  title={cat.name}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Khoảng Giá</h3>
            <form onSubmit={handlePriceApply} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  placeholder="Từ" 
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:outline-none focus:border-shopee focus:ring-1 focus:ring-shopee"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Đến" 
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:outline-none focus:border-shopee focus:ring-1 focus:ring-shopee"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-shopee hover:bg-shopee-hover text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-all focus:outline-none"
              >
                Áp dụng
              </button>
            </form>
          </div>

          {/* Promotion Filter */}
          <div className="mb-6 border-t border-gray-50 dark:border-zinc-800 pt-4">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Khuyến mại</h3>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={flashSaleParam}
                onChange={(e) => updateFilter('flashSale', e.target.checked ? 'true' : null)}
                className="rounded border-gray-300 dark:border-zinc-700 text-shopee focus:ring-shopee h-4 w-4"
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Flame size={13} className="text-shopee fill-shopee" />
                Flash Sale / Giảm giá
              </span>
            </label>
          </div>

          {/* Reset Filters */}
          {(categoryIdParam || flashSaleParam || minPriceParam || maxPriceParam) && (
            <button 
              onClick={handleClearAllFilters}
              className="w-full text-center py-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-xs font-bold rounded-lg transition-all focus:outline-none"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </aside>

        {/* === MAIN PRODUCT SECTION === */}
        <section className="flex-grow w-full flex flex-col gap-4">
          
          {/* Sorting / Toolbar (Desktop & Tablet) */}
          <div className="bg-white dark:bg-zinc-900 p-2.5 md:p-3 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Sắp xếp theo:</span>
              <button 
                onClick={() => updateFilter('sortBy', 'newest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${sortByParam === 'newest' ? 'bg-shopee text-white' : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
              >
                Mới nhất
              </button>
              <button 
                onClick={() => updateFilter('sortBy', 'sold_desc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${sortByParam === 'sold_desc' ? 'bg-shopee text-white' : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
              >
                Bán chạy
              </button>
              <button 
                onClick={() => updateFilter('sortBy', 'price_asc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${sortByParam === 'price_asc' ? 'bg-shopee text-white' : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
              >
                Giá: Thấp đến Cao
              </button>
              <button 
                onClick={() => updateFilter('sortBy', 'price_desc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${sortByParam === 'price_desc' ? 'bg-shopee text-white' : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
              >
                Giá: Cao đến Thấp
              </button>
            </div>
            
            {/* Flash sale toggle on header (for extra premium UX) */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => updateFilter('flashSale', flashSaleParam ? null : 'true')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${flashSaleParam ? 'bg-red-500 text-white border-red-500 shadow-xs' : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
              >
                <Flame size={14} className={flashSaleParam ? 'fill-white text-white' : 'text-shopee fill-shopee'} />
                Flash Sale
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {[...Array(12)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-gray-50 dark:border-zinc-800 flex flex-col gap-3 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full mt-2 w-full" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center shadow-xs min-h-[350px]">
              <div className="h-20 w-20 bg-orange-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-shopee mb-4 animate-bounce">
                <Grid size={40} />
              </div>
              <h3 className="font-bold text-lg text-gray-950 dark:text-white mb-1.5">Không tìm thấy sản phẩm</h3>
              <p className="text-xs text-gray-400 max-w-sm mb-6">
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc từ khóa của bạn. Hãy thử đổi từ khóa hoặc xóa bớt bộ lọc.
              </p>
              <button 
                onClick={handleClearAllFilters}
                className="bg-shopee hover:bg-shopee-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            /* Product List */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {displayedProducts.map(p => {
                const activePrice = p.discountPrice !== null ? p.discountPrice : p.price;
                const discountPercent = p.discountPrice !== null ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : null;
                const soldPercentage = Math.min(100, Math.round(((p.soldQuantity || 0) / (p.quantity + (p.soldQuantity || 0) || 1)) * 100));

                return (
                  <div 
                    key={p.id} 
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="group cursor-pointer bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-700 hover:shadow-md hover:border-shopee/30 dark:hover:border-shopee/30 transition-all relative flex flex-col h-full"
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-zinc-700">
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
                        <Sparkles size={20} />
                        <span className="text-[9px] mt-1 font-semibold">Deal Hot</span>
                      </div>

                      {/* Discount badge */}
                      {discountPercent !== null && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-bl">
                          {discountPercent}% GIẢM
                        </div>
                      )}

                      {/* Wishlist Button (Heart) */}
                      <button
                        onClick={(e) => handleWishlistToggle(e, p.id)}
                        className={`absolute top-2 left-2 p-1.5 rounded-full shadow-xs bg-white/70 dark:bg-black/40 backdrop-blur-xs transition-transform hover:scale-110 focus:outline-none`}
                        title={isInWishlist(p.id) ? "Xóa khỏi yêu thích" : "Yêu thích"}
                      >
                        <Heart 
                          size={14} 
                          className={isInWishlist(p.id) ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-300"} 
                        />
                      </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-2 md:p-3 flex flex-col gap-2 flex-grow justify-between">
                      <div>
                        {/* Title */}
                        <h4 className="text-[11px] md:text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-shopee transition-colors">
                          {p.name}
                        </h4>
                        
                        {/* Pricing */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-xs md:text-sm font-extrabold text-shopee">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                          </span>
                          {discountPercent !== null && (
                            <span className="text-[9px] md:text-[10px] text-gray-400 line-through">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        {/* Sold Progress Bar */}
                        <div className="w-full bg-red-100 dark:bg-red-950/40 h-3.5 rounded-full overflow-hidden relative flex items-center justify-center">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-full absolute left-0 top-0 transition-all duration-500" 
                            style={{ width: `${soldPercentage}%` }}
                          />
                          <span className="text-[8px] md:text-[9px] text-white font-black z-10 drop-shadow-xs uppercase tracking-wider">
                            {p.soldQuantity && p.soldQuantity > 0 ? `Đã bán ${p.soldQuantity}` : "Vừa mở bán"}
                          </span>
                        </div>

                        {/* Add to Cart Quick Button */}
                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="w-full bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100/50 text-shopee border border-shopee/10 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all focus:outline-none"
                        >
                          <ShoppingCart size={12} />
                          <span>Thêm giỏ hàng</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* === MOBILE DRAWER FILTER (SLIDES IN ON MOBILE SCREEN) === */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200 shadow-2xl transition-transform duration-300 transform translate-x-0 z-10 p-5 overflow-y-auto ml-auto">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-800 pb-3 mb-4">
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Filter size={16} className="text-shopee" />
                Bộ lọc tìm kiếm
              </h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Danh mục</h3>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => {
                    updateFilter('categoryId', null);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left text-xs py-2 px-2.5 rounded-lg font-bold transition-all truncate block ${!categoryIdParam ? 'bg-orange-50 dark:bg-orange-950/30 text-shopee' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      updateFilter('categoryId', cat.id.toString());
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs py-2 px-2.5 rounded-lg font-bold transition-all truncate block ${categoryIdParam === cat.id.toString() ? 'bg-orange-50 dark:bg-orange-950/30 text-shopee' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Khoảng Giá</h3>
              <form onSubmit={handlePriceApply} className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Từ" 
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:outline-none focus:border-shopee"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Đến" 
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg focus:outline-none focus:border-shopee"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-shopee hover:bg-shopee-hover text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all"
                >
                  Áp dụng
                </button>
              </form>
            </div>

            {/* Flash Sale */}
            <div className="mb-6 border-t border-gray-150 dark:border-zinc-850 pt-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Khuyến mại</h3>
              <label 
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <input 
                  type="checkbox" 
                  checked={flashSaleParam}
                  onChange={(e) => updateFilter('flashSale', e.target.checked ? 'true' : null)}
                  className="rounded border-gray-300 dark:border-zinc-700 text-shopee focus:ring-shopee h-4 w-4"
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Flame size={13} className="text-shopee fill-shopee" />
                  Flash Sale / Giảm giá
                </span>
              </label>
            </div>

            {/* Clear All button */}
            <button 
              onClick={handleClearAllFilters}
              className="w-full text-center py-2.5 border border-red-200 dark:border-red-900/50 text-red-500 text-xs font-bold rounded-lg mt-auto"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
