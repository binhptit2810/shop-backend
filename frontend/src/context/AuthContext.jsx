import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const role = localStorage.getItem('role');

      if (token && username && role) {
        try {
          // Gửi request lên backend để kiểm tra xem token còn hợp lệ và tài khoản có bị khóa/xóa không
          const response = await API.get('/auth/me');
          const data = response.data;
          setUser({ username: data.username, email: data.email, role: data.role });
        } catch (error) {
          console.error("Xác thực token thất bại hoặc tài khoản bị khóa/xóa:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', { username, password });
      const { accessToken, role, email } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      
      setUser({ username, email, role });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      let errMsg = 'Tên đăng nhập hoặc mật khẩu không chính xác';
      if (!error.response) {
        errMsg = 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra mạng hoặc thử lại sau!';
      } else if (error.response.data && error.response.data.message) {
        errMsg = error.response.data.message;
      }
      return {
        success: false,
        message: errMsg
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await API.post('/auth/register', { username, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã trùng lặp.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setUser(null);
  };

  const isAdmin = () => {
    return user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
