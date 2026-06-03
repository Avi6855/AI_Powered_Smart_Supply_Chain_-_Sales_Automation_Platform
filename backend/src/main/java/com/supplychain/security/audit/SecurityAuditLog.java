package com.supplychain.security.audit;

import com.supplychain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String email;

    private String role;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(nullable = false, length = 500)
    private String path;

    @Column(nullable = false)
    private int status;

    @Column(nullable = false)
    private boolean allowed;

    @Column(length = 300)
    private String reason;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

