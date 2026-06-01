package com.shop.repository;

import com.shop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Tìm kiếm chi tiết mặt hàng trong giỏ theo Cart ID và Product ID.
     * Dùng để kiểm tra trùng sản phẩm khi thêm mới vào giỏ.
     */
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
}
