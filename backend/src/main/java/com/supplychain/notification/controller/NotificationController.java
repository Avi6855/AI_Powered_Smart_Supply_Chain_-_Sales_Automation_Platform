package com.supplychain.notification.controller;
import com.supplychain.notification.dto.NotificationDTO;
import com.supplychain.notification.service.NotificationService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/notifications") @RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDTO>>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(userDetails.getUsername(), pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(userDetails.getUsername())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> broadcast(@RequestBody BroadcastRequest request) {
        notificationService.broadcast(request.getTitle(), request.getMessage(), request.getType(), request.getActionUrl());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @lombok.Data
    public static class BroadcastRequest {
        private String title;
        private String message;
        private String type;
        private String actionUrl;
    }
}