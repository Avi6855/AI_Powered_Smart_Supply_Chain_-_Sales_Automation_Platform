package com.supplychain.notification.repository;
import com.supplychain.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    boolean existsByUserIdAndTitleAndIsReadFalse(Long userId, String title);
    long countByUserIdAndIsReadFalse(Long userId);
}