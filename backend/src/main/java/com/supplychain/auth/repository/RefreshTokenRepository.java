package com.supplychain.auth.repository;
import com.supplychain.auth.entity.RefreshToken;
import com.supplychain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
    void deleteByUser(User user);
    void deleteByToken(String token);
    void deleteByExpiresAtBefore(LocalDateTime now);
}