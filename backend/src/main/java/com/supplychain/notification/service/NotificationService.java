package com.supplychain.notification.service;
import com.supplychain.notification.dto.NotificationDTO;
import com.supplychain.notification.entity.Notification;
import com.supplychain.notification.repository.NotificationRepository;
import com.supplychain.auth.entity.User;
import com.supplychain.auth.repository.UserRepository;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    public PagedResponse<NotificationDTO> getUserNotifications(String email, Pageable pageable) {
        return userRepository.findByEmail(email).map(user -> {
            Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
            return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public long getUnreadCount(String email) {
        return userRepository.findByEmail(email)
                .map(user -> notificationRepository.countByUserIdAndIsReadFalse(user.getId()))
                .orElse(0L);
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new com.supplychain.common.exception.ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getUser().getEmail().equals(email)) {
            throw new com.supplychain.common.exception.BusinessException("Access denied");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @org.springframework.transaction.annotation.Transactional
    public void broadcast(String title, String message, String type, String actionUrl) {
        List<User> users = userRepository.findAll();
        Notification.NotificationType nType = Notification.NotificationType.valueOf(type.toUpperCase());
        
        for (User user : users) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(nType)
                    .actionUrl(actionUrl)
                    .build();
            notificationRepository.save(notification);
        }
    }
    
    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
            .id(n.getId()).title(n.getTitle()).message(n.getMessage())
            .type(n.getType().name()).isRead(n.getIsRead())
            .actionUrl(n.getActionUrl()).createdAt(n.getCreatedAt()).build();
    }
}