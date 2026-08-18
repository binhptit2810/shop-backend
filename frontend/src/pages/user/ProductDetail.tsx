import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useWishlistStore } from '../../store/useWishlistStore';
import { showToast } from '../../services/toast';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  Heart, 
  Check,
  Send,
  Camera
} from 'lucide-react';
import { Product, Review } from '../../types';
import ChatPanel from '../../components/ChatPanel';

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
  const [canReview, setCanReview] = useState(false);
  const [chatInfo, setChatInfo] = useState<{ orderId: number; receiverId: number; receiverName: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
      fetchReviews();
      if (user) {
        fetchWishlist();
        checkPurchaseStatus();
      } else {
        setCanReview(false);
      }
    }
  }, [id, user]);

  const handleChatWithSeller = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để nhắn tin với người bán!', 'error');
      navigate('/login');
      return;
    }

    try {
      const sellerId = product?.sellerId || 1;
      const sellerName = product?.sellerName || 'Admin';

      // Tải danh sách đơn hàng để tìm đơn hàng đã giao dịch với người bán này
      const res = await API.get('/orders/my');
      const orders = res.data || [];

      const matchingOrder = orders.find((order: any) => 
        order.orderStatus !== 'CANCELLED' && 
        order.items?.some((item: any) => {
          const itemSellerId = item.sellerId || 1;
          return itemSellerId === sellerId;
        })
      );

      if (matchingOrder) {
        setChatInfo({
          orderId: matchingOrder.id,
          receiverId: sellerId,
          receiverName: sellerName === 'admin' ? 'Admin' : sellerName
        });
      } else {
        showToast('Bạn cần mua hàng và có ít nhất 1 đơn hàng với người bán này để chat!', 'warning');
      }
    } catch (err) {
      console.error('Lỗi khi chuẩn bị chat:', err);
      showToast('Không thể kết nối dịch vụ chat lúc này.', 'error');
    }
  };

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/products/${id}`);
      const prod: Product = response.data;
      setProduct(prod);
      
      // Set default image
      if (prod.imageUrl) {
        setActiveImage(prod.imageUrl.split(';')[0]);
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

  const checkPurchaseStatus = async () => {
    try {
      const response = await API.get('/orders/my');
      const orders = response.data || [];
      const purchased = orders.some((order: any) => 
        (order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED') &&
        order.items?.some((item: any) => item.productId === parseInt(id || ''))
      );
      setCanReview(purchased);
    } catch (e) {
      console.error("Lỗi khi kiểm tra trạng thái mua hàng:", e);
      setCanReview(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = activeImage 
    ? getProductImageUrl(activeImage) 
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  const imageList = product.imageUrl 
    ? product.imageUrl.split(';').filter(Boolean) 
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'];

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
      await API.post(`/reviews/product/${id}`, {
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

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6 dark:text-gray-100">
      {/* Breadcrumb / Navigation Back */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-xs md:text-sm font-bold transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Product Detail Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xs border border-gray-100 dark:border-gray-700 p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 mb-6">
        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-5/12 flex flex-col gap-4">
          {/* Main Display Image with Hover Zoom */}
          <div 
            className="relative w-full aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100 dark:border-gray-700 cursor-zoom-in flex items-center justify-center"
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
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] md:text-xs font-black px-2 py-1 rounded shadow flex items-center gap-1 animate-pulse">
                <span>⚡ FLASH SALE</span>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {imageList.map((imgUrl, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-sm border flex-shrink-0 p-1 overflow-hidden transition-all focus:outline-none ${
                  activeImage === imgUrl ? 'border-primary ring-1 ring-shopee' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={getProductImageUrl(imgUrl)} alt={`thumbnail-${idx}`} className="w-full h-full object-contain hover:opacity-100 rounded" />
              </button>
            ))}
          </div>

          {/* Wishlist & Share Row */}
          <div className="flex items-center justify-between mt-2 px-1 gap-2 flex-wrap text-xs md:text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span>Chia sẻ:</span>
              <span className="font-bold text-blue-600 hover:underline cursor-pointer">Facebook</span>
              <span className="font-bold text-blue-400 hover:underline cursor-pointer">Twitter</span>
            </div>
            <button 
              onClick={handleWishlistToggle}
              className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-full border ${
                isInWishlist(product.id)
                  ? 'border-red-100 bg-red-50 text-red-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Heart size={14} className={isInWishlist(product.id) ? "fill-red-500 text-red-500 scale-110" : ""} />
              <span>{isInWishlist(product.id) ? `Đã thích (${totalReviews + 42})` : `Yêu thích (${totalReviews + 41})`}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls */}
        <div className="w-full md:w-7/12 flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white leading-snug">
              {product.name}
            </h1>
            
            {/* Stars, Reviews count, Sold Count */}
            <div className="flex items-center gap-3 text-[11px] md:text-xs text-gray-500 divide-x divide-gray-200 dark:divide-gray-700 flex-wrap">
              <div className="flex items-center gap-1 text-primary">
                <span className="underline font-bold text-xs md:text-sm">{avgRating}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={11} 
                      className={`${star <= Math.round(parseFloat(avgRating)) ? 'fill-shopee text-primary' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <span className="pl-3">
                <span className="underline font-bold text-gray-800 dark:text-gray-200">{totalReviews}</span> Đánh giá
              </span>
              <span className="pl-3">
                <span className="font-bold text-gray-800 dark:text-gray-200">{product.soldQuantity || 0}</span> Đã bán
              </span>
            </div>
          </div>

          {/* Pricing Box (Shopee Gradient tint background) */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-sm flex flex-col gap-2 shadow-xs">
            <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
              {product.discountPrice ? (
                <>
                  <span className="text-xl md:text-3xl font-black text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discountPrice)}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                  <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% GIẢM
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl md:text-3xl font-black text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price * 1.25)}
                  </span>
                  <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded">
                    -20% GIẢM
                  </span>
                </>
              )}
            </div>

            {/* Shopee Badges */}
            <div className="flex flex-col gap-2 mt-2 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[11px] md:text-xs text-gray-650 dark:text-gray-300 font-semibold">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20 flex-shrink-0">Người bán:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-gray-800 dark:text-gray-100">
                    {product.sellerName ? (product.sellerName === 'admin' ? 'Admin' : product.sellerName) : 'Admin'}
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {product.sellerName && product.sellerName !== 'admin' ? '✓ Người bán uy tín' : '🛡️ Hệ thống'}
                  </span>
                  <button
                    onClick={handleChatWithSeller}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 px-2.5 py-1 rounded-sm border border-orange-200 dark:border-orange-900/50 transition-all focus:outline-none ml-2"
                  >
                    <span>💬</span>
                    <span>Chat với người bán</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-20 flex-shrink-0">Vận chuyển:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded text-[10px]">Miễn phí vận chuyển</span>
                  <span>Cho đơn hàng từ 150.000₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Selectors */}
          <div className="flex flex-col gap-4 py-1">
            {/* Color variants */}
            {colorsList.length > 0 && (
              <div className="flex items-start gap-3 md:gap-4">
                <span className="text-xs md:text-sm text-gray-400 w-20 mt-1.5 flex-shrink-0">Màu sắc:</span>
                <div className="flex gap-2 flex-wrap">
                  {colorsList.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all flex items-center gap-1 focus:outline-none ${
                        selectedColor === color
                          ? 'border-primary text-primary bg-primary/5 ring-1 ring-shopee'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-850 dark:text-gray-200'
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
              <div className="flex items-start gap-3 md:gap-4">
                <span className="text-xs md:text-sm text-gray-400 w-20 mt-1.5 flex-shrink-0">Kích thước:</span>
                <div className="flex gap-2 flex-wrap">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all flex items-center gap-1 focus:outline-none ${
                        selectedSize === size
                          ? 'border-primary text-primary bg-primary/5 ring-1 ring-shopee'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-850 dark:text-gray-200'
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
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-gray-400 w-20 flex-shrink-0">Số lượng:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                  <button 
                    onClick={() => handleQuantityChange(-1)} 
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300 font-bold focus:outline-none"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs md:text-sm font-black min-w-10 text-center">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)} 
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 disabled:opacity-50 text-gray-600 dark:text-gray-300 font-bold focus:outline-none"
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-gray-450 dark:text-gray-400 font-semibold">
                  {product.quantity > 0 ? `${product.quantity} sản phẩm có sẵn` : 'Hết hàng'}
                </span>
              </div>
            </div>
          </div>

          {/* Call To Actions */}
          {product.quantity > 0 ? (
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex-wrap sm:flex-nowrap">
              <button 
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-primary bg-orange-50 dark:bg-orange-950/20 text-primary hover:bg-orange-100/70 font-bold py-3.5 px-4 rounded-sm transition-all text-xs md:text-sm focus:outline-none"
              >
                <ShoppingCart size={16} className="md:w-[18px] md:h-[18px]" />
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
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-sm transition-all text-xs md:text-sm shadow-xs focus:outline-none"
              >
                Mua ngay
              </button>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 font-bold p-3.5 rounded-sm text-center text-xs md:text-sm">
              Sản phẩm hiện đang tạm hết hàng
            </div>
          )}
        </div>
      </div>

      {/* Description Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xs border border-gray-100 dark:border-gray-700 p-4 md:p-8 mb-6 animate-fade-in">
        <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2.5 mb-3.5">
          Chi tiết sản phẩm
        </h3>
        <div className="flex flex-col gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
        </div>
      </div>

      {/* Reviews Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-xs border border-gray-100 dark:border-gray-700 p-4 md:p-8 animate-fade-in">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 mb-5">
          <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">
            Đánh giá sản phẩm ({totalReviews})
          </h3>
          {canReview ? (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-[10px] md:text-xs font-bold text-primary bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 px-3 py-1.5 rounded-sm transition-all focus:outline-none"
            >
              {showReviewForm ? "Đóng Form viết đánh giá" : "Viết đánh giá sản phẩm"}
            </button>
          ) : user ? (
            <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-sm border border-gray-100/50 dark:border-gray-800">
              Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.
            </span>
          ) : null}
        </div>

        {/* Submit Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-sm mb-5 border border-gray-100 dark:border-gray-800 flex flex-col gap-3.5 animate-fade-in">
            <h4 className="font-bold text-xs md:text-sm">Viết đánh giá của bạn</h4>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Đánh giá sao:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      size={18} 
                      className={star <= ratingInput ? 'fill-shopee text-primary' : 'text-gray-350 hover:text-orange-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="comment" className="text-[11px] text-gray-550">Bình luận của bạn:</label>
              <textarea
                id="comment"
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full text-xs p-3 rounded-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reviewImage" className="text-[11px] text-gray-550">Link hình ảnh sản phẩm (tùy chọn):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="reviewImage"
                  placeholder="Nhập url hình ảnh..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setImageUrlInput("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400")}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 text-xs rounded-sm transition-all flex items-center gap-1 focus:outline-none font-bold"
                  title="Sử dụng ảnh mẫu đẹp"
                >
                  <Camera size={14} />
                  <span>Ảnh mẫu</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-sm self-end transition-all flex items-center gap-2 focus:outline-none shadow-xs"
            >
              <Send size={11} />
              <span>Gửi đánh giá</span>
            </button>
          </form>
        )}

        {/* Rating filter stats */}
        <div className="bg-orange-50/40 dark:bg-gray-950/20 p-4 md:p-5 rounded-sm border border-orange-500/5 flex flex-col md:flex-row gap-5 items-center mb-5">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-primary">{avgRating}</span>
            <span className="text-gray-400 text-[10px] block font-bold">trên 5</span>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={14} 
                  className={`${star <= Math.round(parseFloat(avgRating)) ? 'fill-shopee text-primary' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            <button 
              onClick={() => setReviewFilter('ALL')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all focus:outline-none ${
                reviewFilter === 'ALL' 
                  ? 'border-primary text-primary bg-white dark:bg-gray-800 font-bold shadow-xs' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-500'
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map(num => (
              <button 
                key={num}
                onClick={() => setReviewFilter(num)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all focus:outline-none ${
                  reviewFilter === num 
                    ? 'border-primary text-primary bg-white dark:bg-gray-800 font-bold shadow-xs' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-500'
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
            <div className="py-12 text-center text-gray-400 text-xs md:text-sm">
              Không tìm thấy đánh giá phù hợp nào.
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="py-4.5 flex gap-3 first:pt-0 last:pb-0">
                {/* Avatar circle */}
                <div className="h-8 w-8 bg-orange-100 dark:bg-gray-700 text-primary font-black rounded-full flex items-center justify-center flex-shrink-0 text-xs select-none">
                  {review.username.charAt(0).toUpperCase()}
                </div>
                
                {/* Comment content */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] md:text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{review.username}</span>
                    <span className="text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  {/* Stars rating */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={9} 
                        className={`${star <= review.rating ? 'fill-shopee text-primary' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-1 whitespace-pre-line">
                    {review.comment || 'Khách hàng không để lại bình luận.'}
                  </p>

                  {/* Review Attachment Image */}
                  {review.imageUrl && (
                    <div className="mt-2 w-20 h-20 bg-gray-50 border border-gray-100 dark:border-gray-700 rounded-sm overflow-hidden cursor-zoom-in">
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
      {/* Chat Panel – floating bubble */}
      {chatInfo && (
        <ChatPanel
          orderId={chatInfo.orderId}
          receiverId={chatInfo.receiverId}
          receiverName={chatInfo.receiverName}
          onClose={() => setChatInfo(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
