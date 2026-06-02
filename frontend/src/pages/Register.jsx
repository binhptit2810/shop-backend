import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../services/toast';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }

    if (username.length < 4) {
      showToast('Tên đăng nhập phải chứa ít nhất 4 ký tự!', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'error');
      return;
    }

    setLoading(true);
    const res = await register(username, email, password);
    setLoading(false);

    if (res.success) {
      showToast('Đăng ký thành công! Đang chuyển hướng sang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h2>Đăng Ký Tài Khoản</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tạo tài khoản mới để trải nghiệm mua sắm</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              className="input-field"
              placeholder="Ít nhất 4 ký tự..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Địa chỉ Email</label>
            <input 
              type="email" 
              id="email" 
              className="input-field"
              placeholder="email@example.com..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              className="input-field"
              placeholder="Ít nhất 6 ký tự..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="auth-link">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
