package com.shop.mapper;

import com.shop.dto.OrderItemResponse;
import com.shop.dto.OrderResponse;
import com.shop.entity.Order;
import com.shop.entity.OrderItem;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    /**
     * Chuyển đổi thực thể đơn hàng (Order) sang DTO Response
     */
    public static OrderResponse toResponse(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getOrderItems() != null) {
            itemResponses = order.getOrderItems().stream()
                    .map(OrderMapper::toItemResponse)
                    .collect(Collectors.toList());
        }

        String statusStr = order.getStatus() != null ? order.getStatus().name() : null;
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .username(order.getUser() != null ? order.getUser().getUsername() : null)
                .items(itemResponses)
                .totalPrice(order.getTotalPrice())
                .shippingAddress(order.getShippingAddress())
                .phoneNumber(order.getPhoneNumber())
                .status(statusStr)
                .orderStatus(statusStr)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Chuyển đổi thực thể chi tiết đơn hàng (OrderItem) sang DTO Response
     */
    public static OrderItemResponse toItemResponse(OrderItem item) {
        if (item == null) {
            return null;
        }

        BigDecimal price = item.getPrice();
        String productName = null;
        String imageUrl = null;
        Long productId = null;

        if (item.getProduct() != null) {
            productId = item.getProduct().getId();
            productName = item.getProduct().getName();
            imageUrl = item.getProduct().getImageUrl();
        }

        BigDecimal itemTotalPrice = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return OrderItemResponse.builder()
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
