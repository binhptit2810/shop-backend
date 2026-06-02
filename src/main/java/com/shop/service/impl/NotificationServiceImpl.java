package com.shop.service.impl;

import com.shop.dto.NotificationResponse;
import com.shop.entity.Notification;
import com.shop.entity.User;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.repository.NotificationRepository;
import com.shop.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .content(n.getContent())
                        .isRead(n.isRead())
                        .type(n.getType())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications(User user) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .content(n.getContent())
                        .isRead(n.isRead())
                        .type(n.getType())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(User user, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo!"));

        if (!n.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền thao tác trên thông báo này!");
        }

        n.setRead(true);
        Notification saved = notificationRepository.save(n);

        return NotificationResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .content(saved.getContent())
                .isRead(saved.isRead())
                .type(saved.getType())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String content, String type) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(n);
    }
}
