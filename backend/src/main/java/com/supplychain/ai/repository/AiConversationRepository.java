package com.supplychain.ai.repository;

import com.supplychain.ai.entity.AiConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    Page<AiConversation> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);
    List<AiConversation> findByUserId(Long userId);
}
