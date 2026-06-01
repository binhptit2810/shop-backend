package com.shop.repository;

import com.shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Kiểm tra xem tên danh mục đã tồn tại trong cơ sở dữ liệu chưa.
     * Phục vụ cho nghiệp vụ validation trùng tên danh mục.
     */
    boolean existsByName(String name);
}
