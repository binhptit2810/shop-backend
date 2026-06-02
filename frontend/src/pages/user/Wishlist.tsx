import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/useWishlistStore';
import { CartContext } from '../../context/CartContext';
import { showToast } from '../../services/toast';
import { getImageBaseUrl } from '../../services/api';
import { Heart, ShoppingCart, Trash2, ShoppingBag, Grid } from 'lucide-react';

const Wishlist = () => {
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích.", "info");
    } catch (e) {
      showToast("Không thể xóa sản phẩm khỏi danh sách yêu thích.", "error");
    }
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      showToast(`Đã thêm ${productName} vào giỏ hàng!`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopee"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sản phẩm yêu thích của bạn</h1>
          <p className="text-xs text-gray-400 mt-1">Danh sách sản phẩm bạn đã lưu và quan tâm mua sắm.</p>
        </div>
        <Link to="/" className="text-xs font-semibold text-shopee hover:underline">
          Tiếp tục xem sản phẩm khác
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-20 w-20 bg-red-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
            <Heart size={40} className="fill-red-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-950 dark:text-white mb-1">Danh sách yêu thích trống</h3>
          <p className="text-xs text-gray-400 mb-6">Bạn chưa lưu bất kỳ sản phẩm nào. Bấm vào nút hình trái tim ở trang chi tiết sản phẩm để lưu lại nhé!</p>
          <Link to="/" className="bg-shopee hover:bg-shopee-hover text-white text-xs font-semibold px-6 py-2.5 rounded-md transition-all shadow-sm">
            Khám phá mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map(item => {
            const imgBase = getImageBaseUrl();
            const imgUrl = item.productImageUrl 
              ? (item.productImageUrl.startsWith('http') ? item.productImageUrl : `${imgBase}${item.productImageUrl}`) 
              : 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=250';

            return (
              <div 
                key={item.id} 
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="relative block aspect-square bg-gray-50 overflow-hidden border-b border-gray-50 dark:border-gray-700">
                  <img 
                    src={imgUrl} 
                    alt={item.productName} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2" 
                  />
                  {item.productDiscountPrice && (
                    <span className="absolute top-2 left-2 bg-shopee text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      SALE
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[11px] md:text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight hover:text-shopee cursor-pointer">
                      <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {item.productDiscountPrice ? (
                        <>
                          <span className="font-extrabold text-[11px] md:text-xs text-shopee">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productDiscountPrice)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-[11px] md:text-xs text-shopee">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 border-t border-gray-50 dark:border-gray-700 pt-2.5 mt-auto">
                    <button 
                      onClick={() => handleAddToCart(item.productId, item.productName)}
                      className="flex-1 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100/50 text-shopee border border-shopee/10 text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-all"
                    >
                      <ShoppingCart size={12} />
                      <span>Thêm giỏ</span>
                    </button>
                    <button 
                      onClick={() => handleRemove(item.productId)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 hover:border-red-200 p-1.5 rounded transition-all"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
