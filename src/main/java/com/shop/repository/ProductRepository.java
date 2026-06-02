package com.shop.repository;

import com.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Tìm danh sách sản phẩm thuộc một danh mục sản phẩm.
     */
    List<Product> findByCategoryId(Long categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    boolean existsByCategoryId(Long categoryId);

    @Modifying
    @Query("UPDATE Product p SET p.quantity = p.quantity + :qty WHERE p.id = :id")
    void restoreStock(@Param("id") Long id, @Param("qty") Integer qty);
}
