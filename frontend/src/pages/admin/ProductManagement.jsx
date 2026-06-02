import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X,
  FileImage
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', quantity: '', categoryId: ''
  });

  // Image Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetProductId, setTargetProductId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      setProducts(resProd.data);
      setCategories(resCat.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      showToast('Không thể tải danh sách sản phẩm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      quantity: '',
      categoryId: categories[0]?.id || ''
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      quantity: prod.quantity,
      categoryId: prod.categoryId
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        quantity: parseInt(productForm.quantity),
        categoryId: parseInt(productForm.categoryId)
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
      showToast(error.response?.data?.message || 'Lỗi khi lưu sản phẩm!', 'error');
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

    try {
      await API.post(`/products/${targetProductId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Tải lên hình ảnh sản phẩm thành công!');
      setShowUploadModal(false);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Tải ảnh lên thất bại!', 'error');
    } finally {
      setUploading(false);
    }
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

        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={16} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để tạo mới.
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
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>#{prod.id}</td>
                      <td>
                        {prod.imageUrl ? (
                          <img 
                            src={`${import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8080'}${prod.imageUrl}`} 
                            alt={prod.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '15px' }}>{prod.name}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{prod.quantity}</td>
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

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
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
