package com.shop.repository;

import com.shop.entity.Order;
import com.shop.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Lấy lịch sử đơn hàng của người dùng, sắp xếp từ mới nhất tới cũ nhất
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderItems oi WHERE o.user.id = :userId AND oi.product.id = :productId AND o.status IN (:statuses)")
    boolean existsByUserIdAndProductIdAndStatusIn(
            @Param("userId") Long userId, 
            @Param("productId") Long productId, 
            @Param("statuses") List<OrderStatus> statuses);
}
