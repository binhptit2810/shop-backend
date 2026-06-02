import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      showToast('Không thể tải danh sách danh mục.', 'error');
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
      loadCategories();
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi lưu danh mục!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này có thể ảnh hưởng tới các sản phẩm đang liên kết. Bạn vẫn muốn tiếp tục?')) return;
    try {
      await API.delete(`/categories/${id}`);
      showToast('Xóa danh mục thành công!');
      loadCategories();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa danh mục này.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Danh Mục</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Quản lý các danh mục phân loại sản phẩm của cửa hàng.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={16} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Chưa có danh mục nào. Nhấn "Thêm danh mục" để tạo mới.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Danh Mục</th>
                    <th>Mô Tả Chi Tiết</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 600 }}>#{cat.id}</td>
                      <td style={{ fontWeight: 700, fontSize: '15px' }}>{cat.name}</td>
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
