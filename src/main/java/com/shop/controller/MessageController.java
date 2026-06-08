package com.shop.controller;

import com.shop.dto.MessageRequest;
import com.shop.dto.MessageResponse;
import com.shop.entity.User;
import com.shop.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name = "Message Controller", description = "API nhắn tin giữa người mua và người bán")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(summary = "Gửi tin nhắn mới")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(user, request));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Lấy tất cả tin nhắn của một đơn hàng")
    public ResponseEntity<List<MessageResponse>> getMessagesByOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestParam(required = false) Long withUserId) {
        return ResponseEntity.ok(messageService.getMessagesByOrder(orderId, user, withUserId));
    }

    @PutMapping("/order/{orderId}/read")
    @Operation(summary = "Đánh dấu đã đọc tất cả tin nhắn trong đơn hàng")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        messageService.markAsRead(orderId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Đếm số tin nhắn chưa đọc của người dùng hiện tại")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = messageService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
