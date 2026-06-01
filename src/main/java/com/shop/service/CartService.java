package com.shop.service;

import com.shop.dto.CartItemRequest;
import com.shop.dto.CartResponse;
import com.shop.entity.User;

public interface CartService {

    /**
     * Lấy giỏ hàng của người dùng hiện tại (nếu chưa có giỏ thì tự động khởi tạo)
     */
    CartResponse getCart(User user);

    /**
     * Thêm một sản phẩm vào giỏ hàng
     */
    CartResponse addItem(User user, CartItemRequest request);

    /**
     * Cập nhật số lượng mua của một sản phẩm trong giỏ hàng
     */
    CartResponse updateQuantity(User user, Long cartItemId, int quantity);

    /**
     * Xóa một mặt hàng khỏi giỏ hàng
     */
    CartResponse removeItem(User user, Long cartItemId);

    /**
     * Xóa sạch giỏ hàng (sau khi thanh toán đặt hàng thành công)
     */
    void clearCart(User user);
}
