package com.shop.service;

import com.shop.dto.ProductRequest;
import com.shop.dto.ProductResponse;

import java.util.List;

public interface ProductService {

    /**
     * Tạo mới một sản phẩm
     */
    ProductResponse create(ProductRequest request);

    /**
     * Lấy thông tin sản phẩm theo ID
     */
    ProductResponse getById(Long id);

    /**
     * Lấy toàn bộ danh sách sản phẩm
     */
    List<ProductResponse> getAll();

    /**
     * Lọc sản phẩm theo ID danh mục
     */
    List<ProductResponse> getByCategoryId(Long categoryId);

    /**
     * Cập nhật thông tin sản phẩm theo ID
     */
    ProductResponse update(Long id, ProductRequest request);

    /**
     * Xóa sản phẩm theo ID
     */
    void delete(Long id);

    /**
     * Tải lên hình ảnh cho sản phẩm và cập nhật imageUrl
     */
    ProductResponse uploadImage(Long id, org.springframework.web.multipart.MultipartFile file);
}
