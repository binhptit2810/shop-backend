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
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            phoneNumber: data.phoneNumber,
            address: data.address,
            avatarUrl: data.avatarUrl
          });
          if (data.id) localStorage.setItem('userId', data.id);
        } catch (error) {
          console.error("Xác thực token thất bại hoặc tài khoản bị khóa/xóa:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedFields };
      if (updatedFields.email) {
        localStorage.setItem('email', updatedFields.email);
      }
      return newUser;
    });
  };

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', { username, password });
      const { accessToken, role, email } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      
      // Fetch complete user profile
      const meResponse = await API.get('/auth/me');
      const data = meResponse.data;
      if (data.id) localStorage.setItem('userId', data.id);
      
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarUrl: data.avatarUrl
      });
      return { success: true, role };
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

  const register = async (username, email, password, role = 'USER') => {
    try {
      const response = await API.post('/auth/register', { username, email, password, role });
      return { success: true, message: response.data?.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã trùng lặp.'
      };
    }
  };

  const verifyRegister = async (email, otpCode) => {
    try {
      const response = await API.post('/auth/verify-register', { email, otpCode });
      const { accessToken, role, username } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      
      // Fetch complete user profile
      const meResponse = await API.get('/auth/me');
      const data = meResponse.data;
      if (data.id) localStorage.setItem('userId', data.id);
      
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarUrl: data.avatarUrl
      });
      return { success: true, message: response.data?.message || 'Kích hoạt tài khoản thành công!' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Xác thực mã OTP thất bại.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const isAdmin = () => {
    return user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
  };

  const isSeller = () => {
    return user && (user.role === 'SELLER' || user.role === 'ROLE_SELLER');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyRegister, logout, isAdmin, isSeller, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
