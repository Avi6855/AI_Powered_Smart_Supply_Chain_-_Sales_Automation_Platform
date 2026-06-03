package com.supplychain.analytics.service;
import com.supplychain.analytics.dto.DashboardStatsDTO;
import com.supplychain.analytics.entity.AnalyticsSnapshot;
import com.supplychain.analytics.repository.AnalyticsSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service @RequiredArgsConstructor
public class AnalyticsService {
    private final AnalyticsSnapshotRepository snapshotRepository;
    
    public DashboardStatsDTO getDashboardStats() {
        // Retrieve latest snapshot
        AnalyticsSnapshot latest = snapshotRepository.findTopByOrderBySnapshotDateDesc().orElse(null);
        
        return DashboardStatsDTO.builder()
            .totalRevenue(latest != null ? latest.getTotalRevenue() : BigDecimal.ZERO)
            .revenueGrowth(new BigDecimal("5.2")) // Mock growth
            .totalOrders(latest != null ? latest.getTotalOrders().longValue() : 0L)
            .ordersGrowth(2.5) // Mock growth
            .totalProducts(150L) // Mock count
            .lowStockProducts(12L) // Mock count
            .totalSuppliers(latest != null ? latest.getTotalSuppliers().longValue() : 0L)
            .activeShipments(latest != null ? latest.getActiveShipments().longValue() : 0L)
            .inventoryValue(latest != null ? latest.getInventoryValue() : BigDecimal.ZERO)
            .build();
    }
}