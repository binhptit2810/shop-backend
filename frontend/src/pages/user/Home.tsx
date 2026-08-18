import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Product, Category } from '../../types';
import { ArrowRight, Flame, Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'NEWEST' | 'BEST_SELLER'>('RECOMMENDED');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
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

  const getFilteredProducts = () => {
    if (activeTab === 'NEWEST') {
      return [...products].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }
    if (activeTab === 'BEST_SELLER') {
      return [...products].sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
    }
    return products;
  };

  const flashSaleProducts = products.filter(p => p.isFlashSale || p.discountPrice !== null).slice(0, 4);

  return (
    <div className="flex flex-col gap-16 w-full max-w-7xl mx-auto px-4 py-8 mb-24">
      
      {/* 1. HERO SECTION (Asymmetric) */}
      <section className="flex flex-col md:flex-row gap-8 items-center bg-page">
        <div className="w-full md:w-2/5 flex flex-col items-start gap-6 py-8">
          <span className="text-sm font-bold tracking-widest text-secondary uppercase">Bộ sưu tập mới</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-ink leading-tight">
            Khám phá phong cách tối giản.
          </h1>
          <p className="text-base text-ink-lighter max-w-sm">
            Nâng tầm không gian sống và phong cách cá nhân với những lựa chọn được tuyển chọn kỹ lưỡng từ Bmart.
          </p>
          <button 
            onClick={() => navigate('/search?categoryId=all')}
            className="btn-primary mt-4 focus-visible"
          >
            Mua Sắm Ngay
          </button>
        </div>
        <div className="w-full md:w-3/5 aspect-[4/3] md:aspect-[16/10] bg-base overflow-hidden relative group">
          <img 
            src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1600&q=80" 
            alt="Minimalist design showcase" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </section>

      {/* 2. CATEGORY NAVIGATION (Typography-led, horizontal scroll) */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-base">
          <h2 className="text-2xl font-heading font-bold text-ink pb-4">Danh Mục</h2>
          <Link to="/search" className="text-sm font-medium text-secondary hover:text-ink hidden md:flex items-center gap-1 transition-colors focus-visible">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 pb-4">
          <button
             onClick={() => navigate('/search?categoryId=all')}
             className="text-base font-medium whitespace-nowrap snap-start border-b-2 border-primary text-ink pb-2 focus-visible"
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/search?categoryId=${cat.id}`)}
              className="text-base font-medium whitespace-nowrap snap-start text-secondary hover:text-ink border-b-2 border-transparent hover:border-base transition-colors pb-2 focus-visible"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE */}
      {flashSaleProducts.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-base pb-4">
            <h2 className="text-2xl font-heading font-bold text-ink flex items-center gap-2">
              <Flame size={24} className="text-accent" /> Giá Tốt Hôm Nay
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flashSaleProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN PRODUCT DISPLAY */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-base pb-4">
           <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('RECOMMENDED')}
              className={`text-base md:text-lg font-heading font-bold transition-colors focus-visible ${activeTab === 'RECOMMENDED' ? 'text-ink' : 'text-secondary hover:text-ink'}`}
            >
              Gợi Ý
            </button>
            <button 
              onClick={() => setActiveTab('NEWEST')}
              className={`text-base md:text-lg font-heading font-bold transition-colors focus-visible ${activeTab === 'NEWEST' ? 'text-ink' : 'text-secondary hover:text-ink'}`}
            >
              Mới Nhất
            </button>
            <button 
              onClick={() => setActiveTab('BEST_SELLER')}
              className={`text-base md:text-lg font-heading font-bold transition-colors focus-visible ${activeTab === 'BEST_SELLER' ? 'text-ink' : 'text-secondary hover:text-ink'}`}
            >
              Bán Chạy
            </button>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-surface border border-base flex flex-col">
                <div className="aspect-square bg-[#F1F5F9] animate-pulse rounded-none" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-4 bg-[#F1F5F9] animate-pulse w-3/4 rounded-sm" />
                  <div className="h-4 bg-[#F1F5F9] animate-pulse w-1/2 rounded-sm" />
                  <div className="h-6 bg-[#E2E8F0] animate-pulse w-1/3 mt-2 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : getFilteredProducts().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {getFilteredProducts().map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-surface border border-base">
            <Search size={48} className="text-secondary mb-4" strokeWidth={1} />
            <h3 className="text-xl font-heading font-bold text-ink mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-secondary mb-6">Hiện chưa có sản phẩm nào trong danh mục này.</p>
            <button onClick={() => fetchProducts()} className="btn-secondary focus-visible">Tải Lại</button>
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
