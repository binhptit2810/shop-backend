import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await API.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const addToCart = async (productId, quantity) => {
    try {
      const response = await API.post('/cart/items', { productId, quantity });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng'
      };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await API.put(`/cart/items/${cartItemId}?quantity=${quantity}`);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật số lượng'
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await API.delete(`/cart/items/${cartItemId}`);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng'
      };
    }
  };

  const clearCartLocal = () => {
    setCart(null);
  };

  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCartLocal, fetchCart, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
};
