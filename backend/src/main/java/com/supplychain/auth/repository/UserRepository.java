package com.supplychain.auth.repository;
import com.supplychain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByIsActiveTrue();
    List<User> findByRole(User.Role role);
    
    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(Long userId, LocalDateTime lastLogin);
}