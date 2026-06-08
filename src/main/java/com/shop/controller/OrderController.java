package com.shop.controller;

import com.shop.dto.CheckoutRequest;
import com.shop.dto.OrderResponse;
import com.shop.entity.User;
import com.shop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Các API Đặt hàng & Quản lý Đơn hàng (CRUD Order)")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Đặt hàng và thanh toán từ giỏ hàng hiện tại")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CheckoutRequest request) {
        OrderResponse response = orderService.checkout(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng theo ID")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(user, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Xem lịch sử mua hàng cá nhân")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal User user) {
        List<OrderResponse> response = orderService.getMyOrders(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các đơn hàng hệ thống (Chỉ dành cho ADMIN)")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> response = orderService.getAllOrders();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng (Chỉ dành cho ADMIN)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Khách hàng tự hủy đơn hàng (Khi đang ở trạng thái PENDING)")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(user, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/seller")
    @Operation(summary = "Lấy đơn hàng có sản phẩm của Seller hiện tại (Chỉ dành cho SELLER)")
    public ResponseEntity<List<OrderResponse>> getSellerOrders(@AuthenticationPrincipal User user) {
        List<OrderResponse> response = orderService.getOrdersBySeller(user);
        return ResponseEntity.ok(response);
    }
}
