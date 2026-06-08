package com.shop.repository;

import com.shop.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.orderId = :orderId AND m.receiver.id = :receiverId")
    void markAsReadByOrderIdAndReceiverId(@Param("orderId") Long orderId, @Param("receiverId") Long receiverId);
}
