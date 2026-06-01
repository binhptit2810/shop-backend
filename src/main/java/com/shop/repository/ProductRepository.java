package com.shop.repository;

import com.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Tìm danh sách sản phẩm thuộc một danh mục sản phẩm.
     */
    List<Product> findByCategoryId(Long categoryId);
}
