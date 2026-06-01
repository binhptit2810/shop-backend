package com.shop.controller;

import com.shop.dto.CartItemRequest;
import com.shop.dto.CartResponse;
import com.shop.entity.User;
import com.shop.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart Controller", description = "Các API Quản lý Giỏ hàng (Cart & Cart Items)")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Xem chi tiết giỏ hàng hiện tại")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User user) {
        CartResponse response = cartService.getCart(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    public ResponseEntity<CartResponse> addItemToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addItem(user, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ hàng")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        CartResponse response = cartService.updateQuantity(user, cartItemId, quantity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Xóa sản phẩm khỏi giỏ hàng")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId) {
        CartResponse response = cartService.removeItem(user, cartItemId);
        return ResponseEntity.ok(response);
    }
}
