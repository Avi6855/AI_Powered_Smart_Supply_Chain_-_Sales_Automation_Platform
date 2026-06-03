package com.supplychain.auth.repository;

import com.supplychain.auth.entity.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

    Optional<AuthToken> findByToken(String token);

    Optional<AuthToken> findByTokenAndRevokedFalse(String token);

    @Modifying
    @Query("update AuthToken t set t.revoked = true where t.user.id = :userId and t.revoked = false")
    int revokeAllActiveByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from AuthToken t where t.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);
}

