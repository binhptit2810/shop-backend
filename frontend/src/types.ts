export interface User {
  username: string;
  email: string;
  role: string;
  isLocked?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isDeleted?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  discountPrice?: number;
  colors?: string; // Comma separated colors
  sizes?: string;  // Comma separated sizes
  soldQuantity?: number;
  isFlashSale?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sellerId?: number;
  sellerName?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  id: number;
  cartItems: CartItem[];
  totalPrice: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  username: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  phoneNumber: string;
  status: string;
  orderStatus: string;
  voucherCode?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: number;
  code: string;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  minOrderValue: number;
  maxDiscountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface WishlistResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  productPrice: number;
  productDiscountPrice?: number;
  createdAt: string;
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}
