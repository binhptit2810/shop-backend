import { create } from 'zustand';
import API from '../services/api';
import { WishlistResponse } from '../types';

interface WishlistState {
  items: WishlistResponse[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const response = await API.get('/wishlist');
      set({ items: response.data || [] });
    } catch (error) {
      console.error("Error loading wishlist", error);
    } finally {
      set({ loading: false });
    }
  },
  addToWishlist: async (productId) => {
    try {
      const response = await API.post(`/wishlist/${productId}`);
      set({ items: [...get().items, response.data] });
    } catch (error) {
      console.error("Error adding to wishlist", error);
      throw error;
    }
  },
  removeFromWishlist: async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      set({ items: get().items.filter(item => item.productId !== productId) });
    } catch (error) {
      console.error("Error removing from wishlist", error);
      throw error;
    }
  },
  isInWishlist: (productId) => {
    return get().items.some(item => item.productId === productId);
  },
}));
