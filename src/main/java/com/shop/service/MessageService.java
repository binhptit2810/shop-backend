package com.shop.service;

import com.shop.dto.MessageRequest;
import com.shop.dto.MessageResponse;
import com.shop.entity.User;

import java.util.List;

public interface MessageService {

    MessageResponse sendMessage(User sender, MessageRequest request);

    List<MessageResponse> getMessagesByOrder(Long orderId, User currentUser);

    void markAsRead(Long orderId, User currentUser);

    long getUnreadCount(User currentUser);
}
