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

    /**
     * Cập nhật trực tiếp đường dẫn ảnh của sản phẩm
     */
    ProductResponse updateImageUrl(Long id, String imageUrl);

    /**
     * Tìm kiếm nâng cao sản phẩm (lọc theo tên, danh mục, khoảng giá, sắp xếp và phân trang)
     */
    List<ProductResponse> searchProducts(String name, Long categoryId, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, String sortBy, int page, int size);

    /**
     * Gợi ý từ khóa tìm kiếm liên quan
     */
    List<String> getSearchSuggestions(String query);

    /**
     * Tạo sản phẩm bởi Seller (tự động gắn seller)
     */
    ProductResponse createBySeller(ProductRequest request, com.shop.entity.User seller);

    /**
     * Cập nhật sản phẩm bởi Seller (kiểm tra quyền sở hữu)
     */
    ProductResponse updateBySeller(Long id, ProductRequest request, com.shop.entity.User seller);

    /**
     * Xóa sản phẩm bởi Seller (kiểm tra quyền sở hữu)
     */
    void deleteBySeller(Long id, com.shop.entity.User seller);

    /**
     * Lấy danh sách sản phẩm của một Seller
     */
    List<ProductResponse> getMyProducts(com.shop.entity.User seller);
}
