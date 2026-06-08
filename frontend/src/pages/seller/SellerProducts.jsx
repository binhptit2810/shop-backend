import React, { useState, useEffect } from 'react';
import API, { getProductImageUrl } from '../../services/api';

const defaultForm = {
  name: '', description: '', price: '', quantity: '',
  categoryId: '', discountPrice: '', colors: '', sizes: '',
  imageUrl: '', isFlashSale: false,
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products/my-products'),
        API.get('/categories'),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      quantity: p.quantity || '',
      categoryId: p.categoryId || '',
      discountPrice: p.discountPrice || '',
      colors: p.colors || '',
      sizes: p.sizes || '',
      imageUrl: p.imageUrl || '',
      isFlashSale: p.isFlashSale || false,
    });
    setEditingId(p.id);
    setImageFile(null);
    setImagePreview(p.imageUrl ? getProductImageUrl(p.imageUrl) : '');
    setError('');
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        categoryId: parseInt(form.categoryId),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        colors: form.colors || null,
        sizes: form.sizes || null,
        imageUrl: form.imageUrl || null,
        isFlashSale: form.isFlashSale,
      };

      let savedProduct;
      if (editingId) {
        const res = await API.put(`/products/${editingId}`, payload);
        savedProduct = res.data;
      } else {
        const res = await API.post('/products', payload);
        savedProduct = res.data;
      }

      // Upload image if selected
      if (imageFile && savedProduct?.id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await API.post(`/products/${savedProduct.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(editingId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')) return;
    try {
      await API.delete(`/products/${id}`);
      setSuccess('Xóa sản phẩm thành công!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#888' }}>Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>Sản phẩm của tôi</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>{products.length} sản phẩm</p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: 'linear-gradient(135deg, #e94560, #c0392b)',
            color: '#fff', border: 'none', borderRadius: '12px',
            padding: '12px 24px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(233,69,96,0.4)',
          }}
        >
          ➕ Thêm sản phẩm
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#065f46', fontSize: '14px' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#991b1b', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '620px', maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>
                {editingId ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Tên sản phẩm *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên sản phẩm" required />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Giá bán (đ) *</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" required min="0" />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Giá khuyến mãi (đ)</label>
                  <input style={inputStyle} type="number" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Để trống nếu không có" min="0" />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Số lượng tồn *</label>
                  <input style={inputStyle} type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" required min="0" />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Danh mục *</label>
                  <select style={inputStyle} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Màu sắc</label>
                  <input style={inputStyle} value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Đỏ, Xanh, Trắng..." />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Kích thước</label>
                  <input style={inputStyle} value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL..." />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Mô tả</label>
                  <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết sản phẩm..." />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Ảnh sản phẩm</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ ...inputStyle, padding: '8px' }} />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ marginTop: '12px', width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e2e8f0' }} />
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <input style={inputStyle} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Hoặc nhập URL ảnh" />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="flashSale" checked={form.isFlashSale} onChange={e => setForm({ ...form, isFlashSale: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="flashSale" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>⚡ Flash Sale</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#555' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                    background: saving ? '#ccc' : 'linear-gradient(135deg, #e94560, #c0392b)',
                    color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600,
                  }}
                >
                  {saving ? '⏳ Đang lưu...' : editingId ? '💾 Cập nhật' : '➕ Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Chưa có sản phẩm nào</h3>
          <p style={{ color: '#888', marginBottom: '24px' }}>Hãy thêm sản phẩm đầu tiên của bạn!</p>
          <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #e94560, #c0392b)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            ➕ Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ height: '180px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={getProductImageUrl(p.imageUrl)}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=300'; }}
                />
                {p.isFlashSale && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e94560', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>⚡ SALE</div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {p.discountPrice ? (
                    <>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#e94560' }}>{Number(p.discountPrice).toLocaleString('vi-VN')}đ</span>
                      <span style={{ fontSize: '12px', color: '#aaa', textDecoration: 'line-through' }}>{Number(p.price).toLocaleString('vi-VN')}đ</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a2e' }}>{Number(p.price).toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                  <span>📊 Tồn: {p.quantity}</span>
                  <span>•</span>
                  <span>🏷️ {p.categoryName}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #3b82f6', background: '#fff', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
