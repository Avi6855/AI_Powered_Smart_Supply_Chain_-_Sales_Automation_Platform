package com.supplychain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Refresh token entity for JWT refresh token management.
 * Used to issue new access tokens without requiring re-authentication.
 */
@Entity
@Table(name = "refresh_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Returns true if the token has expired.
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
