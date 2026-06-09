import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { Plus, Edit, Trash2, X, Search, Filter, RefreshCw } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'HAS_PRODUCTS', 'EMPTY'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Mới nhất), 'asc' (Cũ nhất), 'name' (Tên A-Z)

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [responseCat, responseProd] = await Promise.all([
        API.get('/categories'),
        API.get('/products')
      ]);
      setCategories(responseCat.data || []);
      setProducts(responseProd.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh mục và sản phẩm:', error);
      showToast('Không thể tải dữ liệu từ hệ thống.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await API.put(`/categories/${editingCategory.id}`, categoryForm);
        showToast('Cập nhật danh mục thành công!');
      } else {
        await API.post('/categories', categoryForm);
        showToast('Thêm danh mục mới thành công!');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi lưu danh mục!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này có thể ảnh hưởng tới các sản phẩm đang liên kết. Bạn vẫn muốn tiếp tục?')) return;
    try {
      await API.delete(`/categories/${id}`);
      showToast('Xóa danh mục thành công!');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa danh mục này.', 'error');
    }
  };

  // Helper to get number of products in a category
  const getProductCount = (categoryId) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  // Filtering Logic
  const filteredCategories = categories.filter(cat => {
    const prodCount = getProductCount(cat.id);
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'HAS_PRODUCTS' ? prodCount > 0 :
      filterStatus === 'EMPTY' ? prodCount === 0 : true;

    const matchesSearch = 
      cat.id.toString().includes(searchTerm) ||
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Sorting Logic
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name, 'vi');
    }
    return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Danh Mục</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Quản lý các danh mục phân loại sản phẩm của cửa hàng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <RefreshCw size={15} />
            <span>Làm mới</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus size={16} />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel kpi-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG DANH MỤC</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{categories.length}</h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>DANH MỤC HOẠT ĐỘNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#059669' }}>
            {categories.filter(c => getProductCount(c.id) > 0).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid #b45309', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>DANH MỤC TRỐNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#b45309' }}>
            {categories.filter(c => getProductCount(c.id) === 0).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG SẢN PHẨM HỆ THỐNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>{products.length}</h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '280px', marginBottom: 0 }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục theo mã, tên, mô tả..." 
            className="input-field" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sorting */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600, width: 'auto', display: 'inline-block' }}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lọc:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'HAS_PRODUCTS', label: 'Hoạt động' },
                { value: 'EMPTY', label: 'Danh mục trống' }
              ].map(item => (
                <button
                  key={item.value}
                  className={`category-chip ${filterStatus === item.value ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setFilterStatus(item.value)}
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
            {sortedCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Không tìm thấy danh mục nào phù hợp với bộ lọc.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Danh Mục</th>
                    <th>Số Sản Phẩm</th>
                    <th>Mô Tả Chi Tiết</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map(cat => {
                    const prodCount = getProductCount(cat.id);
                    return (
                      <tr key={cat.id}>
                        <td style={{ fontWeight: 600 }}>#{cat.id}</td>
                        <td style={{ fontWeight: 700, fontSize: '15px' }}>{cat.name}</td>
                        <td>
                          <span style={{ 
                            fontSize: '13px', 
                            background: prodCount > 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(180, 83, 9, 0.1)', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontWeight: 700, 
                            color: prodCount > 0 ? '#059669' : '#b45309' 
                          }}>
                            {prodCount} sản phẩm
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{cat.description || 'Không có mô tả chi tiết'}</td>
                        <td>
                          <div className="actions-cell">
                            <button onClick={() => openEditModal(cat)} className="qty-btn" title="Chỉnh sửa">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="qty-btn" style={{ color: 'var(--error)' }} title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Tên danh mục</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={categoryForm.name} 
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Nhập tên danh mục (ví dụ: Điện thoại, Laptop...)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  value={categoryForm.description} 
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Mô tả tóm tắt về loại sản phẩm này..."
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

    </div>
  );
};

export default CategoryManagement;
