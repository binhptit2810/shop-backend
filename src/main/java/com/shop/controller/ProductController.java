package com.shop.controller;

import com.shop.dto.ProductRequest;
import com.shop.dto.ProductResponse;
import com.shop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "Các API Quản lý Sản phẩm (CRUD Product)")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Tạo sản phẩm mới")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết sản phẩm theo ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả sản phẩm")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> response = productService.getAll();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Lấy danh sách sản phẩm theo danh mục")
    public ResponseEntity<List<ProductResponse>> getProductsByCategoryId(@PathVariable Long categoryId) {
        List<ProductResponse> response = productService.getByCategoryId(categoryId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật sản phẩm theo ID")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm theo ID")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên/Cập nhật ảnh cho sản phẩm")
    public ResponseEntity<ProductResponse> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        ProductResponse response = productService.uploadImage(id, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/image-url")
    @Operation(summary = "Cập nhật trực tiếp đường dẫn ảnh của sản phẩm")
    public ResponseEntity<ProductResponse> updateImageUrl(
            @PathVariable Long id,
            @RequestParam String imageUrl) {
        ProductResponse response = productService.updateImageUrl(id, imageUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm nâng cao sản phẩm")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.searchProducts(name, categoryId, minPrice, maxPrice, sortBy, page, size));
    }

    @GetMapping("/search/suggest")
    @Operation(summary = "Gợi ý từ khóa tìm kiếm liên quan")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestParam String query) {
        return ResponseEntity.ok(productService.getSearchSuggestions(query));
    }
}
