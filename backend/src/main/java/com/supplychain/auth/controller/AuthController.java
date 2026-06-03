package com.supplychain.auth.controller;
import com.supplychain.auth.dto.*;
import com.supplychain.auth.service.AuthService;
import com.supplychain.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/signup")
    @Operation(summary = "Register new user")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.signup(request)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request.getRefreshToken())));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(userDetails.getUsername())));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}