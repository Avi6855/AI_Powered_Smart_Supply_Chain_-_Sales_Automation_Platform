package com.supplychain.auth.service;
import com.supplychain.auth.dto.*;
import com.supplychain.auth.entity.*;
import com.supplychain.auth.repository.*;
import com.supplychain.common.exception.*;
import com.supplychain.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthTokenService authTokenService;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return buildAuthResponse(user);
    }
    
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered", "EMAIL_EXISTS");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match", "PASSWORD_MISMATCH");
        }
        
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .username(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.ANALYST)
                .phone(request.getPhone())
                .department(request.getDepartment())
                .isActive(true)
                .build();
                
        userRepository.save(user);
        return buildAuthResponse(user);
    }
    
    @Transactional
    public AuthResponse refreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(refreshToken -> {
                    if (refreshToken.isExpired()) {
                        refreshTokenRepository.delete(refreshToken);
                        throw new BusinessException("Refresh token was expired. Please make a new signin request", "REFRESH_TOKEN_EXPIRED");
                    }
                    return buildAuthResponse(refreshToken.getUser());
                })
                .orElseThrow(() -> new BusinessException("Refresh token is not in database!", "INVALID_REFRESH_TOKEN"));
    }
    
    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            refreshTokenRepository.deleteByUser(user);
            authTokenService.revokeAllForUser(user.getId());
        });
    }
    
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match", "PASSWORD_MISMATCH");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
                
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid current password", "INVALID_PASSWORD");
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public UserDTO getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .map(UserDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
    
    private AuthResponse buildAuthResponse(User user) {
        String jwt = jwtTokenProvider.generateToken(user);
        authTokenService.storeToken(
                user,
                jwt,
                jwtTokenProvider.getExpirationFromToken(jwt).toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
        );
        RefreshToken refreshToken = createRefreshToken(user);
        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
                .expiresIn(jwtTokenProvider.getExpirationTime())
                .user(UserDTO.from(user))
                .build();
    }
    
    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }
}
