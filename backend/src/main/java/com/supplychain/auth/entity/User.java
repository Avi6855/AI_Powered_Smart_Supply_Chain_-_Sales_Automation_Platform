package com.supplychain.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User entity representing platform users with role-based access control.
 * Implements Spring Security's UserDetails for authentication integration.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@EqualsAndHashCode(exclude = {"createdAt", "updatedAt"})
@ToString(exclude = {"passwordHash"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ================================================================
    // UserDetails implementation
    // ================================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.name()),
                new SimpleGrantedAuthority(role.name())
        );
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email; // Use email as the principal identifier
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return Boolean.TRUE.equals(isActive);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Returns the display name of the user.
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    // ================================================================
    // Role enum with hierarchy
    // ================================================================

    public enum Role {
        SUPER_ADMIN("Super Administrator"),
        ADMIN("Administrator"),
        SALES_MANAGER("Sales Manager"),
        WAREHOUSE_MANAGER("Warehouse Manager"),
        ANALYST("Analyst");

        private final String displayName;

        Role(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }

        /**
         * Returns true if this role has at least the permissions of the given role.
         */
        public boolean hasAtLeast(Role minimumRole) {
            return this.ordinal() <= minimumRole.ordinal();
        }
    }
}
