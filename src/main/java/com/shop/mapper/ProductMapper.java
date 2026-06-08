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
            try {
                categoryId = product.getCategory().getId();
                categoryName = product.getCategory().getName();
            } catch (jakarta.persistence.EntityNotFoundException e) {
                categoryId = null;
                categoryName = "[Danh mục đã bị xóa]";
            }
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
                .discountPrice(product.getDiscountPrice())
                .colors(product.getColors())
                .sizes(product.getSizes())
                .soldQuantity(product.getSoldQuantity())
                .isFlashSale(product.isFlashSale())
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
                .discountPrice(request.getDiscountPrice())
                .colors(request.getColors())
                .sizes(request.getSizes())
                .isFlashSale(request.isFlashSale())
                .soldQuantity(0)
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
        product.setDiscountPrice(request.getDiscountPrice());
        product.setColors(request.getColors());
        product.setSizes(request.getSizes());
        product.setFlashSale(request.isFlashSale());
    }
}
