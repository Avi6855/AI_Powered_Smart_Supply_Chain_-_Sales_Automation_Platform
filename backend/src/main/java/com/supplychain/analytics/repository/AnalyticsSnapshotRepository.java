package com.supplychain.analytics.repository;
import com.supplychain.analytics.entity.AnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {
    Optional<AnalyticsSnapshot> findTopByOrderBySnapshotDateDesc();
}