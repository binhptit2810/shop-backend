import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../services/toast';
import API from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email input, 2: OTP & reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    setLoading(true);
    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      showToast('Đăng nhập thành công!');
      if (res.role === 'SELLER') {
        navigate('/seller');
      } else if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRequestForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Vui lòng nhập địa chỉ email!', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await API.post('/auth/forgot-password/request', { email: forgotEmail });
      showToast(response.data || 'Mã OTP đã được gửi về email của bạn.', 'success');
      setForgotStep(2);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || 'Không thể gửi yêu cầu khôi phục mật khẩu. Vui lòng kiểm tra lại email!';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmForgot = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || !forgotNewPassword.trim() || !forgotConfirmPassword.trim()) {
      showToast('Vui lòng điền đầy đủ các trường!', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (forgotNewPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await API.post('/auth/forgot-password/confirm', {
        email: forgotEmail,
        otpCode: forgotOtp,
        newPassword: forgotNewPassword,
        confirmNewPassword: forgotConfirmPassword
      });
      showToast(response.data || 'Đặt lại mật khẩu thành công!', 'success');
      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data || 'OTP không hợp lệ hoặc đã hết hạn!';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-scale-in">
        <div className="auth-header">
          <h2>Chào Mừng Trở Lại</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Đăng nhập tài khoản của bạn để mua sắm</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              className="input-field"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Mật khẩu</label>
              <button 
                type="button" 
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotStep(1);
                }} 
                className="auth-link" 
                style={{ fontSize: '13px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
              >
                Quên mật khẩu?
              </button>
            </div>
            <input 
              type="password" 
              id="password" 
              className="input-field"
              placeholder="Nhập mật khẩu của bạn..."
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
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Chưa có tài khoản? </span>
          <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '30px',
            position: 'relative',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              &times;
            </button>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestForgot}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Quên Mật Khẩu?</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nhập địa chỉ email của bạn để nhận mã xác thực OTP.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-email">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    id="forgot-email" 
                    className="input-field"
                    placeholder="example@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Đang gửi OTP...' : 'Gửi mã xác thực OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmForgot}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Xác Thực OTP</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Mã xác thực đã được gửi đến email <strong>{forgotEmail}</strong>. Vui lòng nhập OTP và mật khẩu mới bên dưới.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-otp">Mã xác thực OTP (6 chữ số)</label>
                  <input 
                    type="text" 
                    id="forgot-otp" 
                    className="input-field"
                    placeholder="Nhập 6 chữ số OTP..."
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-new-password">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    id="forgot-new-password" 
                    className="input-field"
                    placeholder="Tối thiểu 6 ký tự..."
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-confirm-password">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    id="forgot-confirm-password" 
                    className="input-field"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setForgotStep(1)}
                    className="btn" 
                    style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#1f2937' }}
                  >
                    Quay lại
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '12px' }}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
