package com.shop.service;

import com.shop.dto.NotificationResponse;
import com.shop.entity.User;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(User user);
    List<NotificationResponse> getMyUnreadNotifications(User user);
    NotificationResponse markAsRead(User user, Long notificationId);
    void createNotification(User user, String title, String content, String type);
}
