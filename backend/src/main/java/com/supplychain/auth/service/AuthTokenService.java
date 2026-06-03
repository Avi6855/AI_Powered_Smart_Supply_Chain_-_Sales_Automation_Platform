package com.supplychain.auth.service;

import com.supplychain.auth.entity.AuthToken;
import com.supplychain.auth.entity.User;
import com.supplychain.auth.repository.AuthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthTokenService {

    private final AuthTokenRepository authTokenRepository;

    @Transactional
    public void storeToken(User user, String token, LocalDateTime expiresAt) {
        AuthToken entity = AuthToken.builder()
                .user(user)
                .token(token)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();
        authTokenRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public boolean isTokenActive(String token) {
        return authTokenRepository.findByTokenAndRevokedFalse(token)
                .filter(t -> !t.isExpired())
                .isPresent();
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        authTokenRepository.revokeAllActiveByUserId(userId);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = authTokenRepository.deleteExpired(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Deleted {} expired auth tokens", deleted);
        }
    }
}

