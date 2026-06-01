package com.shop.mapper;

import com.shop.dto.CartItemResponse;
import com.shop.dto.CartResponse;
import com.shop.entity.Cart;
import com.shop.entity.CartItem;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    /**
     * Chuyển đổi thực thể giỏ hàng (Cart) sang DTO Response
     */
    public static CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (cart.getCartItems() != null) {
            itemResponses = cart.getCartItems().stream()
                    .map(CartMapper::toItemResponse)
                    .collect(Collectors.toList());

            // Tính tổng tiền toàn bộ giỏ hàng = tổng các (giá sản phẩm * số lượng mua)
            totalPrice = itemResponses.stream()
                    .map(CartItemResponse::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalPrice(totalPrice)
                .build();
    }

    /**
     * Chuyển đổi thực thể mục sản phẩm trong giỏ (CartItem) sang DTO Response
     */
    public static CartItemResponse toItemResponse(CartItem item) {
        if (item == null) {
            return null;
        }

        BigDecimal price = BigDecimal.ZERO;
        String productName = null;
        String imageUrl = null;
        Long productId = null;

        if (item.getProduct() != null) {
            productId = item.getProduct().getId();
            price = item.getProduct().getPrice();
            productName = item.getProduct().getName();
            imageUrl = item.getProduct().getImageUrl();
        }

        BigDecimal itemTotalPrice = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(productId)
                .productName(productName)
                .price(price)
                .imageUrl(imageUrl)
                .quantity(item.getQuantity())
                .totalPrice(itemTotalPrice)
                .build();
    }
}
