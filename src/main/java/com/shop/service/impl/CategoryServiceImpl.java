package com.shop.service.impl;

import com.shop.dto.CategoryRequest;
import com.shop.dto.CategoryResponse;
import com.shop.entity.Category;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.mapper.CategoryMapper;
import com.shop.repository.CategoryRepository;
import com.shop.repository.ProductRepository;
import com.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục '" + request.getName() + "' đã tồn tại!");
        }
        Category category = CategoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return CategoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        return CategoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

        // Kiểm tra trùng tên với danh mục khác (trừ chính nó)
        if (categoryRepository.existsByName(request.getName()) && !category.getName().equals(request.getName())) {
            throw new BadRequestException("Tên danh mục '" + request.getName() + "' đã tồn tại!");
        }

        CategoryMapper.updateEntity(request, category);
        Category updatedCategory = categoryRepository.save(category);
        return CategoryMapper.toResponse(updatedCategory);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        if (productRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Không thể xóa danh mục này vì vẫn còn sản phẩm thuộc danh mục!");
        }
        categoryRepository.delete(category);
    }
}
