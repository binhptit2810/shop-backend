package com.shop.service;

import com.shop.dto.CheckoutRequest;
import com.shop.dto.OrderResponse;
import com.shop.entity.User;

import java.util.List;

public interface OrderService {

    /**
     * Thực hiện thanh toán và đặt hàng từ giỏ hàng hiện tại
     */
    OrderResponse checkout(User user, CheckoutRequest request);

    /**
     * Lấy chi tiết đơn hàng theo ID (có bảo mật kiểm tra sở hữu hoặc quyền ADMIN)
     */
    OrderResponse getOrderById(User user, Long orderId);

    /**
     * Lấy danh sách lịch sử đơn hàng của người dùng hiện tại
     */
    List<OrderResponse> getMyOrders(User user);

    /**
     * Lấy toàn bộ danh sách đơn hàng của hệ thống (Chỉ dành cho ADMIN)
     */
    List<OrderResponse> getAllOrders();

    /**
     * Cập nhật trạng thái đơn hàng (Chỉ dành cho ADMIN)
     */
    OrderResponse updateOrderStatus(Long orderId, String status);
}
