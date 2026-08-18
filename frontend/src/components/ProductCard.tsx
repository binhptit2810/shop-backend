import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { getProductImageUrl } from '../services/api';
import { ShoppingCart, Check, Image as ImageIcon } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { showToast } from '../services/toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { addToCart } = useContext(CartContext);
  
  const activePrice = product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;
  
  const isOutOfStock = product.quantity <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding || addSuccess) return;
    
    setIsAdding(true);
    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        setAddSuccess(true);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => setAddSuccess(false), 2000);
      } else {
        showToast(result.message, "error");
      }
    } catch (err) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group flex flex-col h-full bg-surface border border-base rounded-none focus-visible transition-colors duration-200 hover:border-primary relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#F1F5F9] overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={getProductImageUrl(product.imageUrl.split(';')[0])} 
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03] ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            onError={(e: any) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback Image */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted bg-[#F1F5F9]"
          style={{ display: product.imageUrl ? 'none' : 'flex' }}
        >
          <ImageIcon size={24} strokeWidth={1.5} />
        </div>

        {/* Badges */}
        <div className="absolute top-0 left-0 flex flex-col gap-1 z-10">
          {hasDiscount && !isOutOfStock && (
            <div className="bg-accent text-white text-sm font-medium px-2 py-0.5">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[#1E293B] text-white text-sm font-bold px-3 py-1 uppercase tracking-wider">
              Hết Hàng
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4 gap-2">
        <h3 className="text-base font-medium text-ink line-clamp-2 leading-tight" title={product.name}>
          {product.name}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1 pt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-heading text-lg font-bold text-ink">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-ink-muted line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
               {/* Minimal rating display - mocked as requested in analysis */}
               <span className="text-sm text-secondary tracking-tight">★ 4.8 <span className="opacity-70">(120)</span></span>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label="Thêm vào giỏ hàng"
              className={`p-2 rounded-sm transition-colors duration-200 focus-visible
                ${isOutOfStock 
                  ? 'bg-base text-ink-muted cursor-not-allowed' 
                  : addSuccess
                    ? 'bg-success text-white'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }
              `}
            >
              {isAdding ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : addSuccess ? (
                <Check size={16} />
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
