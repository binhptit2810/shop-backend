import React, { useState, useEffect } from 'react';
import API, { getImageBaseUrl, getProductImageUrl } from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X,
  FileImage,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' or categoryId
  const [filterStock, setFilterStock] = useState('ALL'); // 'ALL', 'IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priceAsc', 'priceDesc', 'stockAsc', 'stockDesc'

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStock, sortBy]);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', quantity: '', categoryId: '', imageUrl: ''
  });

  // Image Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetProductId, setTargetProductId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formImages, setFormImages] = useState(['', '', '', '']);
  const fileInputRef = React.useRef(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);
      setProducts(resProd.data || []);
      setCategories(resCat.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      showToast('Không thể tải danh sách sản phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormImages(['', '', '', '']);
    setProductForm({
      name: '',
      description: '',
      price: '',
      quantity: '',
      categoryId: categories[0]?.id || '',
      imageUrl: ''
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    const imgList = prod.imageUrl ? prod.imageUrl.split(';') : [];
    const slots = ['', '', '', ''];
    for (let i = 0; i < Math.min(imgList.length, 4); i++) {
      slots[i] = imgList[i] || '';
    }
    setFormImages(slots);
    setProductForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      quantity: prod.quantity,
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleFormImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ảnh không được vượt quá 5MB!', 'error');
        return;
      }
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Project Thương Mại Điện Tử');
      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dpqivf7oe/image/upload', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          throw new Error('Upload to Cloudinary failed');
        }
        const data = await res.json();
        setProductForm(prev => ({
          ...prev,
          imageUrl: data.secure_url
        }));
        showToast('Tải ảnh lên Cloudinary thành công!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi tải ảnh lên đám mây Cloudinary!', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const triggerSlotUpload = (index) => {
    setActiveUploadIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSlotImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && activeUploadIndex !== null) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ảnh không được vượt quá 5MB!', 'error');
        return;
      }
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Project Thương Mại Điện Tử');
      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dpqivf7oe/image/upload', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          throw new Error('Upload to Cloudinary failed');
        }
        const data = await res.json();
        setFormImages(prev => {
          const next = [...prev];
          next[activeUploadIndex] = data.secure_url;
          return next;
        });
        showToast(`Tải ảnh ${activeUploadIndex + 1} lên Cloudinary thành công!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Lỗi khi tải ảnh lên đám mây Cloudinary!', 'error');
      } finally {
        setUploadingImage(false);
        setActiveUploadIndex(null);
        e.target.value = ''; // Reset input to allow choosing same file
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const combinedImageUrl = formImages.filter(url => url && url.trim() !== '').join(';');
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        categoryId: parseInt(productForm.categoryId),
        imageUrl: combinedImageUrl || null
      };

      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, payload);
        showToast('Cập nhật sản phẩm thành công!');
      } else {
        await API.post('/products', payload);
        showToast('Thêm sản phẩm mới thành công!');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      let errMsg = 'Lỗi khi lưu sản phẩm!';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors && data.errors.length > 0) {
          errMsg = data.errors.join('; ');
        } else if (data.message) {
          errMsg = data.message;
        }
      }
      showToast(errMsg, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      await API.delete(`/products/${id}`);
      showToast('Đã xóa sản phẩm thành công!');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa sản phẩm.', 'error');
    }
  };

  // --- IMAGE UPLOAD LOGIC ---
  const openUploadModal = (productId) => {
    setTargetProductId(productId);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Vui lòng chọn tệp hình ảnh!', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', 'Project Thương Mại Điện Tử');

    try {
      // 1. Tải lên Cloudinary
      const res = await fetch('https://api.cloudinary.com/v1_1/dpqivf7oe/image/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error('Cloudinary upload failed');
      }
      const data = await res.json();

      // 2. Cập nhật đường dẫn ảnh trên backend
      await API.put(`/products/${targetProductId}/image-url?imageUrl=${encodeURIComponent(data.secure_url)}`);

      showToast('Cập nhật hình ảnh sản phẩm thành công!', 'success');
      setShowUploadModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Tải ảnh lên đám mây Cloudinary thất bại!', 'error');
    } finally {
      setUploading(false);
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredProducts = products.filter(prod => {
    const matchesCategory = filterCategory === 'ALL' ? true : prod.categoryId === parseInt(filterCategory);
    
    const matchesStock = 
      filterStock === 'ALL' ? true :
      filterStock === 'IN_STOCK' ? prod.quantity > 0 :
      filterStock === 'OUT_OF_STOCK' ? prod.quantity === 0 :
      filterStock === 'LOW_STOCK' ? prod.quantity > 0 && prod.quantity <= 5 : true;

    const matchesSearch = 
      prod.id.toString().includes(searchTerm) ||
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prod.categoryName && prod.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesStock && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'oldest': return a.id - b.id;
      case 'priceAsc': return a.price - b.price;
      case 'priceDesc': return b.price - a.price;
      case 'stockAsc': return a.quantity - b.quantity;
      case 'stockDesc': return b.quantity - a.quantity;
      case 'newest':
      default:
        return b.id - a.id;
    }
  });

  // Pagination Calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Sản Phẩm</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Xem danh sách, thêm, chỉnh sửa thông tin hoặc thay đổi hình ảnh sản phẩm.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <RefreshCw size={15} />
            <span>Làm mới</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel kpi-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG SẢN PHẨM</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{products.length}</h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>SẢN PHẨM CÒN HÀNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#059669' }}>
            {products.filter(p => p.quantity > 0).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>SẢN PHẨM HẾT HÀNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>
            {products.filter(p => p.quantity === 0).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #ea580c', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>CẢNH BÁO TỒN KHO (≤ 5)</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#ea580c' }}>
            {products.filter(p => p.quantity > 0 && p.quantity <= 5).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG GIÁ TRỊ TỒN KHO</span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0)
            )}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, mô tả, danh mục..." 
            className="input-field" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Danh mục:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600, width: 'auto', display: 'inline-block' }}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600, width: 'auto', display: 'inline-block' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
              <option value="stockAsc">Tồn kho ít nhất</option>
              <option value="stockDesc">Tồn kho nhiều nhất</option>
            </select>
          </div>

          {/* Stock Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bộ lọc:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'IN_STOCK', label: 'Còn hàng' },
                { value: 'LOW_STOCK', label: 'Sắp hết' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' }
              ].map(item => (
                <button
                  key={item.value}
                  className={`category-chip ${filterStock === item.value ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setFilterStock(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            {sortedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Giá Bán</th>
                    <th>Tồn Kho</th>
                    <th>Danh Mục</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map(prod => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>#{prod.id}</td>
                      <td>
                        {prod.imageUrl ? (
                          <img 
                            src={getProductImageUrl(prod.imageUrl.split(';')[0])} 
                            alt={prod.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justify5Content: 'center', color: 'var(--text-muted)' }}>
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '15px' }}>{prod.name}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                      </td>
                      <td>
                        {prod.quantity === 0 ? (
                          <span style={{ color: '#ef4444', fontWeight: 800, background: '#fee2e2', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Hết hàng
                          </span>
                        ) : prod.quantity <= 5 ? (
                          <span style={{ color: '#ea580c', fontWeight: 800, background: '#ffedd5', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {prod.quantity} (Sắp hết)
                          </span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{prod.quantity}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {prod.categoryName}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button onClick={() => openEditModal(prod)} className="qty-btn" title="Chỉnh sửa thông tin">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => openUploadModal(prod.id)} className="qty-btn" style={{ color: 'var(--primary)' }} title="Tải ảnh sản phẩm">
                            <Upload size={16} />
                          </button>
                          <button onClick={() => handleDelete(prod.id)} className="qty-btn" style={{ color: 'var(--error)' }} title="Xóa sản phẩm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '20px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--border-color)', 
              flexWrap: 'wrap', 
              gap: '12px' 
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Hiển thị <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, sortedProducts.length)}</strong> trong tổng số <strong>{sortedProducts.length}</strong> sản phẩm
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Trước
                </button>
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`category-chip ${currentPage === pageNum ? 'active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá bán (VND)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={productForm.price} 
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="Ví dụ: 15000000..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={productForm.quantity} 
                  onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                  placeholder="Ví dụ: 50..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select 
                  className="input-field" 
                  value={productForm.categoryId} 
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Mô tả các thông số kỹ thuật, bảo hành..."
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh sản phẩm (Tối đa 4 ảnh)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {formImages.map((url, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        position: 'relative', 
                        aspectRatio: '1', 
                        borderRadius: '8px', 
                        border: '1.5px dashed var(--border-color)', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        overflow: 'hidden',
                        background: 'var(--bg-tertiary)'
                      }}
                    >
                      {url ? (
                        <>
                          <img 
                            src={getProductImageUrl(url)} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setFormImages(prev => {
                                const next = [...prev];
                                next[idx] = '';
                                return next;
                              });
                            }}
                            style={{ 
                              position: 'absolute', 
                              top: '4px', 
                              right: '4px', 
                              background: 'rgba(255, 0, 0, 0.8)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '50%', 
                              width: '20px', 
                              height: '20px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                              zIndex: 10
                            }}
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => triggerSlotUpload(idx)}
                          disabled={uploadingImage}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-secondary)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '4px',
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          <Plus size={16} />
                          <span style={{ fontSize: '10px' }}>Ảnh {idx + 1}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleSlotImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadingImage}>
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Tải Lên Ảnh Sản Phẩm</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImageUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="image-upload-wrapper">
                <input 
                  type="file" 
                  id="admin-product-file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="admin-product-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={32} style={{ margin: '0 auto 10px', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                    Chọn tệp hình ảnh
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Chấp nhận PNG, JPG, JPEG, GIF, WEBP dưới 5MB
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img src={previewUrl} alt="Preview" className="upload-preview" />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading || !selectedFile}>
                  {uploading ? 'Đang tải...' : 'Bắt đầu tải lên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
