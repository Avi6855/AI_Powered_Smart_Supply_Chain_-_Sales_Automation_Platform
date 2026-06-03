package com.supplychain.analytics.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "analytics_snapshots") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AnalyticsSnapshot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "snapshot_date", unique = true, nullable = false) private LocalDate snapshotDate;
    @Column(name = "total_revenue", precision = 16, scale = 2) private BigDecimal totalRevenue;
    @Column(name = "total_orders") private Integer totalOrders;
    @Column(name = "total_products_sold") private Integer totalProductsSold;
    @Column(name = "new_customers") private Integer newCustomers;
    @Column(name = "avg_order_value", precision = 12, scale = 2) private BigDecimal avgOrderValue;
    @Column(name = "top_category", length = 100) private String topCategory;
    @Column(name = "inventory_value", precision = 16, scale = 2) private BigDecimal inventoryValue;
    @Column(name = "total_suppliers") private Integer totalSuppliers;
    @Column(name = "active_shipments") private Integer activeShipments;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}