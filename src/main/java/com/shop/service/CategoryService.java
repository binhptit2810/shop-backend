package com.shop.service;

import com.shop.dto.CategoryRequest;
import com.shop.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    /**
     * Tạo mới một danh mục
     */
    CategoryResponse create(CategoryRequest request);

    /**
     * Lấy danh mục chi tiết theo ID
     */
    CategoryResponse getById(Long id);

    /**
     * Lấy toàn bộ danh sách danh mục
     */
    List<CategoryResponse> getAll();

    /**
     * Cập nhật thông tin danh mục theo ID
     */
    CategoryResponse update(Long id, CategoryRequest request);

    /**
     * Xóa danh mục theo ID
     */
    void delete(Long id);
}
