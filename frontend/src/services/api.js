import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
});

// Request interceptor đính kèm JWT token vào header Authorization
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor xử lý lỗi 401/403 (Token hết hạn hoặc tài khoản bị khóa/xóa)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Chỉ tự động reload/đăng xuất nếu không phải là API đăng nhập hoặc API kiểm tra session
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default API;
