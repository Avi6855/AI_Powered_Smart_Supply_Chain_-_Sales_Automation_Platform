package com.supplychain.auth.dto;
import com.supplychain.auth.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
    private User.Role role;
    private String phone;
    private String department;
}