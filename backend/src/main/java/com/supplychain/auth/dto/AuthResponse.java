package com.supplychain.auth.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserDTO user;
}