package com.shop.mapper;

import com.shop.dto.CategoryRequest;
import com.shop.dto.CategoryResponse;
import com.shop.entity.Category;

public class CategoryMapper {

    /**
     * Chuyển đổi từ Entity sang DTO Response
     */
    public static CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Chuyển đổi từ DTO Request sang Entity mới
     */
    public static Category toEntity(CategoryRequest request) {
        if (request == null) {
            return null;
        }
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    /**
     * Cập nhật thông tin thực thể từ Request DTO
     */
    public static void updateEntity(CategoryRequest request, Category category) {
        if (request == null || category == null) {
            return;
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
    }
}
