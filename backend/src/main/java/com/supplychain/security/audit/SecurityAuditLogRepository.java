package com.supplychain.security.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {
}

