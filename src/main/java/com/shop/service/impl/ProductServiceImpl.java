package com.shop.service.impl;

import com.shop.dto.ProductRequest;
import com.shop.dto.ProductResponse;
import com.shop.entity.Category;
import com.shop.entity.Product;
import com.shop.exception.ResourceNotFoundException;
import com.shop.mapper.ProductMapper;
import com.shop.repository.CategoryRepository;
import com.shop.repository.ProductRepository;
import com.shop.service.FileStorageService;
import com.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.shop.exception.BadRequestException;
import java.io.IOException;
import java.util.Base64;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        Product product = ProductMapper.toEntity(request);
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);
        return ProductMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getByCategoryId(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId);
        }
        return productRepository.findByCategoryId(categoryId).stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        ProductMapper.updateEntity(request, product);
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);
        return ProductMapper.toResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        
        // Nếu sản phẩm đã có ảnh, tiến hành xóa tệp tin ảnh trên đĩa cứng
        if (product.getImageUrl() != null && !product.getImageUrl().startsWith("data:")) {
            fileStorageService.deleteFile(product.getImageUrl());
        }
        
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse uploadImage(Long id, MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tin tải lên trống");
        }

        // Store new image file
        com.shop.service.FileStorageResult storageResult = fileStorageService.storeFile(file);
        String newImageUrl = storageResult.getFileUrl();

        // Delete old image file if it exists
        String oldImageUrl = product.getImageUrl();
        if (oldImageUrl != null && !oldImageUrl.trim().isEmpty()) {
            if (!oldImageUrl.startsWith("data:")) { // Don't try to delete base64 strings as files
                fileStorageService.deleteFile(oldImageUrl);
            }
        }

        // Update image URL and Public ID in DB
        product.setImageUrl(newImageUrl);
        product.setImagePublicId(storageResult.getPublicId());
        Product updatedProduct = productRepository.save(product);

        return ProductMapper.toResponse(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String name, Long categoryId, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, String sortBy, int page, int size) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            switch (sortBy.toLowerCase()) {
                case "newest":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
                    break;
                case "price_asc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "price");
                    break;
                case "price_desc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "price");
                    break;
                case "sold_desc":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "soldQuantity");
                    break;
                default:
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
                    break;
            }
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        return productRepository.searchProducts(name, categoryId, minPrice, maxPrice, pageable).stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse updateImageUrl(Long id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        product.setImageUrl(imageUrl);
        Product updatedProduct = productRepository.save(product);
        return ProductMapper.toResponse(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSearchSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        org.springframework.data.domain.Pageable limit = org.springframework.data.domain.PageRequest.of(0, 10);
        return productRepository.findNamesByQuery(query.trim(), limit);
    }

    @Override
    @Transactional
    public ProductResponse createBySeller(ProductRequest request, com.shop.entity.User seller) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        Product product = ProductMapper.toEntity(request);
        product.setCategory(category);
        product.setSeller(seller);

        Product savedProduct = productRepository.save(product);
        return ProductMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateBySeller(Long id, ProductRequest request, com.shop.entity.User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new com.shop.exception.BadRequestException("Bạn không có quyền chỉnh sửa sản phẩm này");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        ProductMapper.updateEntity(request, product);
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);
        return ProductMapper.toResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteBySeller(Long id, com.shop.entity.User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new com.shop.exception.BadRequestException("Bạn không có quyền xóa sản phẩm này");
        }

        if (product.getImageUrl() != null && !product.getImageUrl().startsWith("data:")) {
            fileStorageService.deleteFile(product.getImageUrl());
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(com.shop.entity.User seller) {
        return productRepository.findBySellerId(seller.getId()).stream()
                .map(ProductMapper::toResponse)
                .collect(Collectors.toList());
    }
}
