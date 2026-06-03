package com.supplychain.auth.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private boolean rememberMe;
}