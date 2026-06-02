import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { showToast } from '../../services/toast';
import { 
  Users, 
  Search, 
  Shield, 
  User as UserIcon, 
  Mail, 
  ShoppingBag, 
  Phone, 
  RefreshCw,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách thành viên:', error);
      showToast('Không thể tải danh sách thành viên từ máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLockModal = (user) => {
    setSelectedUser(user);
    setLockReason('');
    setShowLockModal(true);
  };

  const handleLockUser = async () => {
    if (!selectedUser) return;
    if (!lockReason.trim()) {
      showToast('Vui lòng nhập lý do khóa tài khoản!', 'error');
      return;
    }
    try {
      const response = await API.put(`/users/${selectedUser.id}/lock`, {
        isLocked: true,
        reason: lockReason.trim()
      });
      showToast(`Đã khóa tài khoản "${selectedUser.username}" thành công.`);
      setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
      setShowLockModal(false);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi khóa tài khoản.', 'error');
    }
  };

  const handleUnlockUser = async (user) => {
    try {
      const response = await API.put(`/users/${user.id}/lock`, {
        isLocked: false,
        reason: ''
      });
      showToast(`Đã mở khóa tài khoản "${user.username}" thành công.`);
      setUsers(users.map(u => u.id === user.id ? response.data : u));
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi mở khóa tài khoản.', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.username}" không? Thao tác này không thể hoàn tác.`)) {
      try {
        await API.delete(`/users/${user.id}`);
        showToast(`Đã xóa tài khoản "${user.username}" thành công.`);
        setUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error(error);
        showToast(error.response?.data?.message || 'Không thể xóa người dùng này.', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Thành Viên</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Xem danh sách người dùng, thay đổi trạng thái hoạt động (Khóa/Mở khóa) và xóa tài khoản thành viên.
          </p>
        </div>

        <button onClick={loadUsers} className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <RefreshCw size={15} />
          <span>Tải lại danh sách</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel kpi-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>TỔNG THÀNH VIÊN</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{users.length}</h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>QUẢN TRỊ VIÊN (ADMIN)</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
            {users.filter(u => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>ĐANG HOẠT ĐỘNG</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
            {users.filter(u => !u.isLocked).length}
          </h3>
        </div>
        <div className="glass-panel kpi-card" style={{ padding: '16px', borderLeft: '4px solid var(--error)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>BỊ KHÓA TÀI KHOẢN</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--error)' }}>
            {users.filter(u => u.isLocked).length}
          </h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div className="search-input-wrapper" style={{ marginBottom: 0 }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thành viên theo tên đăng nhập hoặc email..." 
            className="input-field" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Không tìm thấy thành viên nào.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thông Tin Thành Viên</th>
                    <th>Vai Trò</th>
                    <th>Email</th>
                    <th>Trạng Thái</th>
                    <th>Đơn đã mua</th>
                    <th>Tổng chi tiêu</th>
                    <th style={{ textAlign: 'right' }}>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'var(--primary)' : 'var(--success)'
                          }}>
                            {u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? <Shield size={16} /> : <UserIcon size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{u.username}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Ngày tạo: {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          padding: '4px 10px', 
                          borderRadius: '20px',
                          background: u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                          color: u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'var(--primary)' : 'var(--text-secondary)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <Mail size={12} />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {u.isLocked ? (
                            <>
                              <span className="badge badge-cancelled" style={{ alignSelf: 'flex-start' }}>🔒 Bị khóa</span>
                              {u.statusReason && (
                                <span style={{ fontSize: '11px', color: 'var(--error)', fontStyle: 'italic', maxWidth: '180px' }}>
                                  Lý do: {u.statusReason}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="badge badge-completed" style={{ alignSelf: 'flex-start' }}>🟢 Hoạt động</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShoppingBag size={13} color="var(--text-muted)" />
                          <span>{u.totalOrders}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(u.totalSpent)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.role !== 'ADMIN' && u.role !== 'ROLE_ADMIN' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {u.isLocked ? (
                              <button 
                                onClick={() => handleUnlockUser(u)} 
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--success)', color: 'var(--success)' }}
                                title="Mở khóa tài khoản"
                              >
                                <Unlock size={14} style={{ marginRight: '4px' }} />
                                Mở khóa
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleOpenLockModal(u)} 
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                                title="Khóa tài khoản"
                              >
                                <Lock size={14} style={{ marginRight: '4px' }} />
                                Khóa
                              </button>
                            )}
                            
                            <button 
                              onClick={() => handleDeleteUser(u)} 
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--error)', color: 'var(--error)' }}
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Không thể thay đổi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Lock Reason Dialog Modal */}
      {showLockModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel" style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Khóa Tài Khoản</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Nhập lý do khóa tài khoản của thành viên <strong>{selectedUser?.username}</strong>. Lý do này sẽ hiển thị khi họ đăng nhập.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>LÝ DO KHÓA:</label>
              <textarea 
                className="input-field"
                rows="4"
                placeholder="Nhập lý do chi tiết..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                style={{ resize: 'none', padding: '10px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowLockModal(false)} 
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLockUser} 
                className="btn btn-primary"
                style={{ padding: '8px 16px', background: 'var(--warning)', borderColor: 'var(--warning)' }}
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
