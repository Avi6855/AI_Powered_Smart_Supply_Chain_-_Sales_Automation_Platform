package com.supplychain.auth.dto;
import com.supplychain.auth.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private User.Role role;
    private Boolean isActive;
    private String avatarUrl;
    private String phone;
    private String department;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    
    public static UserDTO from(User user) {
        if (user == null) return null;
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .avatarUrl(user.getAvatarUrl())
            .phone(user.getPhone())
            .department(user.getDepartment())
            .lastLogin(user.getLastLogin())
            .createdAt(user.getCreatedAt())
            .build();
    }
}