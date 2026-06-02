import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useWishlistStore } from '../../store/useWishlistStore';
import { showToast } from '../../services/toast';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  Heart, 
  MessageSquare, 
  Check,
  Send,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Review } from '../../types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [reviewFilter, setReviewFilter] = useState<number | 'ALL'>('ALL');
  
  // Submit Review state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
      fetchReviews();
      if (user) {
        fetchWishlist();
      }
    }
  }, [id, user]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/products/${id}`);
      const prod: Product = response.data;
      setProduct(prod);
      
      // Set default image
      if (prod.imageUrl) {
        setActiveImage(prod.imageUrl);
      }
      
      // Set default variant selections
      if (prod.colors) {
        const colorList = prod.colors.split(',').map(c => c.trim());
        if (colorList.length > 0) setSelectedColor(colorList[0]);
      }
      if (prod.sizes) {
        const sizeList = prod.sizes.split(',').map(s => s.trim());
        if (sizeList.length > 0) setSelectedSize(sizeList[0]);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      showToast('Không tìm thấy sản phẩm!', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/reviews/product/${id}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
    }
  };

  const handleQuantityChange = (val: number) => {
    const newQty = quantity + val;
    if (product && newQty >= 1 && newQty <= product.quantity) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'error');
      navigate('/login');
      return;
    }

    if (!product) return;

    // Attach variant selections to request if available (handled locally or via custom metadata if needed)
    // Here we use core addToCart. If the backend doesn't support variant IDs directly yet, we pass standard productId.
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'error');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        showToast("Đã xóa khỏi danh sách yêu thích!", "info");
      } else {
        await addToWishlist(product.id);
        showToast("Đã thêm vào danh sách yêu thích!", "success");
      }
    } catch (error) {
      showToast("Không thể cập nhật danh sách yêu thích", "error");
    }
  };

  // Image Zoom on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      showToast("Vui lòng nhập nội dung đánh giá!", "error");
      return;
    }

    try {
      const response = await API.post(`/reviews/product/${id}`, {
        rating: ratingInput,
        comment: commentInput,
        imageUrl: imageUrlInput
      });
      showToast("Đánh giá sản phẩm thành công!", "success");
      setCommentInput('');
      setImageUrlInput('');
      setShowReviewForm(false);
      fetchReviews();
      fetchProductDetail(); // Reload product (in case ratings change)
    } catch (error: any) {
      console.error("Lỗi đăng đánh giá:", error);
      showToast(error.response?.data?.message || "Bạn cần phải mua sản phẩm này trước khi đánh giá!", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopee"></div>
      </div>
    );
  }

  if (!product) return null;

  const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8080';
  const imageUrl = activeImage 
    ? (activeImage.startsWith('http') ? activeImage : `${imageBase}${activeImage}`) 
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  // Parse color & size arrays
  const colorsList = product.colors ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const sizesList = product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Calculate rating stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : '5.0';

  const filteredReviews = reviewFilter === 'ALL' 
    ? reviews 
    : reviews.filter(r => r.rating === reviewFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:text-gray-100">
      {/* Breadcrumb / Navigation Back */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-shopee text-sm transition-colors">
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Product Detail Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 flex flex-col md:flex-row gap-8 mb-6">
        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-5/12 flex flex-col gap-4">
          {/* Main Display Image with Hover Zoom */}
          <div 
            className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
            {/* Hover Zoom Overlay */}
            <div 
              className="absolute inset-0 bg-no-repeat pointer-events-none"
              style={zoomStyle}
            />

            {/* Flash Sale Ribbon if applicable */}
            {product.isFlashSale && (
              <div className="absolute top-2 left-2 bg-shopee text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1 animate-pulse">
                <span className="text-[10px]">⚡ FLASH SALE</span>
              </div>
            )}
          </div>

          {/* Thumbnail list (Using product image and fallback mock thumbnails for premium feel) */}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            <button 
              onClick={() => product.imageUrl && setActiveImage(product.imageUrl)}
              className={`w-20 h-20 bg-gray-50 rounded-md border flex-shrink-0 p-1 overflow-hidden transition-all ${
                activeImage === product.imageUrl ? 'border-shopee ring-1 ring-shopee' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${imageBase}${product.imageUrl}`) : imageUrl} alt="thumbnail" className="w-full h-full object-contain" />
            </button>
            {/* Fallback extra thumbnails for premium aesthetic */}
            {['/images/thumb1.jpg', '/images/thumb2.jpg', '/images/thumb3.jpg'].map((thumb, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(imageUrl)}
                className="w-20 h-20 bg-gray-50 rounded-md border border-gray-200 hover:border-gray-300 flex-shrink-0 p-1 overflow-hidden transition-all"
              >
                <img src={imageUrl} alt="thumbnail" className="w-full h-full object-contain opacity-70 hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Wishlist & Share Row */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Chia sẻ:</span>
              <span className="font-semibold text-blue-600 hover:underline cursor-pointer">Facebook</span>
              <span className="font-semibold text-blue-400 hover:underline cursor-pointer">Twitter</span>
            </div>
            <button 
              onClick={handleWishlistToggle}
              className={`flex items-center gap-2 text-sm font-semibold transition-all px-3 py-1.5 rounded-full border ${
                isInWishlist(product.id)
                  ? 'border-red-100 bg-red-50 text-red-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Heart size={16} className={isInWishlist(product.id) ? "fill-red-500 text-red-500 scale-110" : ""} />
              <span>{isInWishlist(product.id) ? `Đã thích (${totalReviews + 42})` : `Yêu thích (${totalReviews + 41})`}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls */}
        <div className="w-full md:w-7/12 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            
            {/* Stars, Reviews count, Sold Count */}
            <div className="flex items-center gap-4 text-xs text-gray-500 divide-x divide-gray-200 dark:divide-gray-700 flex-wrap">
              <div className="flex items-center gap-1 text-shopee">
                <span className="underline font-bold text-sm">{avgRating}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={12} 
                      className={`${star <= Math.round(parseFloat(avgRating)) ? 'fill-shopee text-shopee' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <span className="pl-4">
                <span className="underline font-semibold text-gray-800 dark:text-gray-200 text-sm">{totalReviews}</span> Đánh giá
              </span>
              <span className="pl-4">
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{product.soldQuantity || 0}</span> Đã bán
              </span>
            </div>
          </div>

          {/* Pricing Box (Shopee Gradient tint background) */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md flex flex-col gap-2.5">
            <div className="flex items-baseline gap-4 flex-wrap">
              {product.discountPrice ? (
                <>
                  <span className="text-2xl md:text-3xl font-bold text-shopee">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discountPrice)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                  <span className="bg-shopee/10 text-shopee text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% GIẢM
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl md:text-3xl font-bold text-shopee">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                  {/* Default fake discount if product has no discountPrice to keep Shopee visual parity */}
                  <span className="text-sm text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price * 1.25)}
                  </span>
                  <span className="bg-shopee/10 text-shopee text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -20% GIẢM
                  </span>
                </>
              )}
            </div>

            {/* Shopee Badges */}
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-24">Vận chuyển:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">Miễn phí vận chuyển</span>
                  <span>Miễn phí vận chuyển cho đơn hàng từ 150.000₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Selectors */}
          <div className="flex flex-col gap-4 py-2">
            {/* Color variants */}
            {colorsList.length > 0 && (
              <div className="flex items-start gap-4">
                <span className="text-sm text-gray-400 w-24 mt-1.5">Màu sắc:</span>
                <div className="flex gap-2 flex-wrap">
                  {colorsList.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all flex items-center gap-1 ${
                        selectedColor === color
                          ? 'border-shopee text-shopee bg-shopee/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {selectedColor === color && <Check size={12} />}
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size variants */}
            {sizesList.length > 0 && (
              <div className="flex items-start gap-4">
                <span className="text-sm text-gray-400 w-24 mt-1.5">Kích thước:</span>
                <div className="flex gap-2 flex-wrap">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all flex items-center gap-1 ${
                        selectedSize === size
                          ? 'border-shopee text-shopee bg-shopee/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {selectedSize === size && <Check size={12} />}
                      <span>{size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-24">Số lượng:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  <button 
                    onClick={() => handleQuantityChange(-1)} 
                    className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold min-w-10 text-center">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)} 
                    className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300"
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.quantity > 0 ? `${product.quantity} sản phẩm có sẵn` : 'Hết hàng'}
                </span>
              </div>
            </div>
          </div>

          {/* Call To Actions */}
          {product.quantity > 0 ? (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={handleAddToCart}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border border-shopee bg-orange-50 dark:bg-orange-950/20 text-shopee hover:bg-orange-100/70 font-semibold px-6 py-3 rounded-md transition-all text-sm"
              >
                <ShoppingCart size={18} />
                <span>Thêm vào giỏ hàng</span>
              </button>
              
              <button 
                onClick={async () => {
                  if (!user) {
                    showToast('Vui lòng đăng nhập để mua hàng!', 'error');
                    navigate('/login');
                    return;
                  }
                  await addToCart(product.id, quantity);
                  navigate('/cart');
                }}
                className="flex-1 md:flex-initial bg-shopee hover:bg-shopee-hover text-white font-semibold px-8 py-3 rounded-md transition-all text-sm shadow-sm"
              >
                Mua ngay
              </button>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 font-semibold p-4 rounded text-center">
              Sản phẩm hiện đang tạm hết hàng
            </div>
          )}
        </div>
      </div>

      {/* Description Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
          Chi tiết sản phẩm
        </h3>
        <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
        </div>
      </div>

      {/* Reviews Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Đánh giá sản phẩm ({totalReviews})
          </h3>
          {user && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs font-semibold text-shopee bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded transition-all"
            >
              {showReviewForm ? "Đóng Form viết đánh giá" : "Viết đánh giá sản phẩm"}
            </button>
          )}
        </div>

        {/* Submit Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-950/30 p-4 rounded-lg mb-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4 animate-fade-in">
            <h4 className="font-bold text-sm">Viết đánh giá của bạn</h4>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Đánh giá sao:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      size={20} 
                      className={star <= ratingInput ? 'fill-shopee text-shopee' : 'text-gray-300 hover:text-orange-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-xs text-gray-500">Bình luận của bạn:</label>
              <textarea
                id="comment"
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (chất lượng, giao hàng, đóng gói...)"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full text-xs p-3 rounded border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-shopee bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reviewImage" className="text-xs text-gray-500">Link hình ảnh sản phẩm (tùy chọn):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="reviewImage"
                  placeholder="Nhập url hình ảnh..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-shopee bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setImageUrlInput("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400")}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 text-xs rounded transition-all flex items-center gap-1.5"
                  title="Sử dụng ảnh mẫu đẹp"
                >
                  <Camera size={14} />
                  <span>Ảnh mẫu</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="bg-shopee hover:bg-shopee-hover text-white text-xs font-semibold px-4 py-2 rounded-md self-end transition-all flex items-center gap-2"
            >
              <Send size={12} />
              <span>Gửi đánh giá</span>
            </button>
          </form>
        )}

        {/* Rating filter stats */}
        <div className="bg-orange-50/40 dark:bg-gray-950/20 p-5 rounded-lg border border-orange-500/5 flex flex-col md:flex-row gap-6 items-center mb-6">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-shopee">{avgRating}</span>
            <span className="text-gray-400 text-xs block">trên 5</span>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={16} 
                  className={`${star <= Math.round(parseFloat(avgRating)) ? 'fill-shopee text-shopee' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button 
              onClick={() => setReviewFilter('ALL')}
              className={`px-4 py-1.5 text-xs rounded-full border transition-all ${
                reviewFilter === 'ALL' 
                  ? 'border-shopee text-shopee bg-white dark:bg-gray-800 font-semibold shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map(num => (
              <button 
                key={num}
                onClick={() => setReviewFilter(num)}
                className={`px-4 py-1.5 text-xs rounded-full border transition-all ${
                  reviewFilter === num 
                    ? 'border-shopee text-shopee bg-white dark:bg-gray-800 font-semibold shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {num} Sao ({reviews.filter(r => r.rating === num).length})
              </button>
            ))}
          </div>
        </div>

        {/* Review Comments list */}
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Không tìm thấy đánh giá phù hợp nào.
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="py-5 flex gap-4 first:pt-0 last:pb-0">
                {/* Avatar circle */}
                <div className="h-9 w-9 bg-orange-100 dark:bg-gray-700 text-shopee font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {review.username.charAt(0).toUpperCase()}
                </div>
                
                {/* Comment content */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{review.username}</span>
                    <span className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  {/* Stars rating */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={10} 
                        className={`${star <= review.rating ? 'fill-shopee text-shopee' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                    {review.comment || 'Khách hàng không để lại bình luận.'}
                  </p>

                  {/* Review Attachment Image */}
                  {review.imageUrl && (
                    <div className="mt-2 w-24 h-24 bg-gray-50 border border-gray-100 dark:border-gray-700 rounded overflow-hidden cursor-zoom-in">
                      <img 
                        src={review.imageUrl} 
                        alt="review attachment" 
                        className="w-full h-full object-cover" 
                        onClick={() => window.open(review.imageUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
