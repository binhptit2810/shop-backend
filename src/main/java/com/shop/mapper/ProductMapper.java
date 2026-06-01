package com.shop.mapper;

import com.shop.dto.ProductRequest;
import com.shop.dto.ProductResponse;
import com.shop.entity.Product;

public class ProductMapper {

    /**
     * Chuyển đổi từ Entity sang DTO Response
     */
    public static ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }

        Long categoryId = null;
        String categoryName = null;
        if (product.getCategory() != null) {
            categoryId = product.getCategory().getId();
            categoryName = product.getCategory().getName();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .categoryId(categoryId)
                .categoryName(categoryName)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    /**
     * Chuyển đổi từ DTO Request sang Entity mới (chưa có liên kết Category)
     */
    public static Product toEntity(ProductRequest request) {
        if (request == null) {
            return null;
        }
        return Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(request.getImageUrl())
                .build();
    }

    /**
     * Cập nhật thông tin thực thể từ Request DTO (chưa cập nhật liên kết Category)
     */
    public static void updateEntity(ProductRequest request, Product product) {
        if (request == null || product == null) {
            return;
        }
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setImageUrl(request.getImageUrl());
    }
}
