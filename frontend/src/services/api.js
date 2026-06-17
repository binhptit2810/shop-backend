import axios from 'axios';

let apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
// Chuẩn hóa đường dẫn: tự động thêm '/api/v1' nếu thiếu
if (apiBase) {
  if (apiBase.endsWith('/')) {
    apiBase = apiBase.slice(0, -1);
  }
  if (!apiBase.endsWith('/api/v1')) {
    apiBase = apiBase + '/api/v1';
  }
}

const API = axios.create({
  baseURL: apiBase,
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
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getImageBaseUrl = () => {
  if (import.meta.env.VITE_IMAGE_BASE_URL) {
    return import.meta.env.VITE_IMAGE_BASE_URL;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  try {
    const url = new URL(apiBase);
    return url.origin;
  } catch (e) {
    return 'http://localhost:8080';
  }
};

export const getProductImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200';
  // If there are multiple images separated by a semicolon, take the first one
  const actualUrl = url.includes(';') ? url.split(';')[0] : url;
  if (!actualUrl) return 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200';

  if (actualUrl.startsWith('http') || actualUrl.startsWith('data:')) {
    return actualUrl;
  }
  return `${getImageBaseUrl()}${actualUrl}`;
};

export default API;


