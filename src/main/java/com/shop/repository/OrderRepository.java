package com.shop.repository;

import com.shop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Lấy lịch sử đơn hàng của người dùng, sắp xếp từ mới nhất tới cũ nhất
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
