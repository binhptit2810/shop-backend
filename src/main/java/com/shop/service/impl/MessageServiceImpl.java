package com.shop.service.impl;

import com.shop.dto.MessageRequest;
import com.shop.dto.MessageResponse;
import com.shop.entity.Message;
import com.shop.entity.Order;
import com.shop.entity.User;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.repository.MessageRepository;
import com.shop.repository.OrderRepository;
import com.shop.repository.UserRepository;
import com.shop.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MessageResponse sendMessage(User sender, MessageRequest request) {
        // Validate order exists and user is related (buyer or seller)
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        // Validate user is buyer or seller related to this order
        boolean isBuyer = order.getUser().getId().equals(sender.getId());
        boolean isSellerRelated = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getSeller() != null
                        && item.getProduct().getSeller().getId().equals(sender.getId()));

        if (!isBuyer && !isSellerRelated) {
            throw new BadRequestException("Bạn không có quyền nhắn tin trong đơn hàng này");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận với ID: " + request.getReceiverId()));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .orderId(request.getOrderId())
                .content(request.getContent())
                .isRead(false)
                .build();

        Message saved = messageRepository.save(message);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByOrder(Long orderId, User currentUser, Long withUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        boolean isBuyer = order.getUser().getId().equals(currentUser.getId());
        boolean isSellerRelated = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getSeller() != null
                        && item.getProduct().getSeller().getId().equals(currentUser.getId()));

        if (!isBuyer && !isSellerRelated) {
            throw new BadRequestException("Bạn không có quyền xem tin nhắn của đơn hàng này");
        }

        List<Message> messages = messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);

        // Bảo mật: Chỉ cho phép người dùng xem tin nhắn mà họ tham gia (là người gửi hoặc người nhận)
        messages = messages.stream()
                .filter(msg -> msg.getSender().getId().equals(currentUser.getId())
                        || msg.getReceiver().getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        // Nếu có chỉ định đối tác chat cụ thể, lọc tiếp để chỉ hiển thị hội thoại giữa currentUser và đối tác đó
        if (withUserId != null) {
            messages = messages.stream()
                    .filter(msg ->
                        (msg.getSender().getId().equals(currentUser.getId()) && msg.getReceiver().getId().equals(withUserId)) ||
                        (msg.getSender().getId().equals(withUserId) && msg.getReceiver().getId().equals(currentUser.getId()))
                    )
                    .collect(Collectors.toList());
        }

        return messages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long orderId, User currentUser) {
        messageRepository.markAsReadByOrderIdAndReceiverId(orderId, currentUser.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User currentUser) {
        return messageRepository.countByReceiverIdAndIsReadFalse(currentUser.getId());
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getUsername())
                .orderId(message.getOrderId())
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
