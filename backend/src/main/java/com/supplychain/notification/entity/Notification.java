package com.supplychain.notification.entity;
import com.supplychain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String message;
    @Enumerated(EnumType.STRING) @Column(length = 30) @Builder.Default private NotificationType type = NotificationType.INFO;
    @Column(name = "is_read") @Builder.Default private Boolean isRead = false;
    @Column(name = "action_url", length = 500) private String actionUrl;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    
    public enum NotificationType { INFO, SUCCESS, WARNING, ERROR, ALERT, AI }
}