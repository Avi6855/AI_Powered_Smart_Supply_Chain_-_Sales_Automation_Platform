package com.supplychain.analytics.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal totalRevenue;
    private BigDecimal revenueGrowth;
    private Long totalOrders;
    private Double ordersGrowth;
    private Long totalProducts;
    private Long lowStockProducts;
    private Long totalSuppliers;
    private Long activeShipments;
    private BigDecimal inventoryValue;
}