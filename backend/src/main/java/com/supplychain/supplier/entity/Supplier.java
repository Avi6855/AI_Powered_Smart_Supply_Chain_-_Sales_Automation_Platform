package com.supplychain.supplier.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "suppliers") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(unique = true, nullable = false, length = 50) private String code;
    @Column(length = 100) private String email;
    @Column(length = 30) private String phone;
    private String address;
    @Column(length = 100) private String city;
    @Column(length = 100) private String state;
    @Column(length = 100) private String country;
    @Column(length = 20) private String postalCode;
    @Column(precision = 3, scale = 2) @Builder.Default private BigDecimal rating = BigDecimal.ZERO;
    @Column(name = "performance_score", precision = 5, scale = 2) @Builder.Default private BigDecimal performanceScore = BigDecimal.ZERO;
    @Column(name = "total_orders") @Builder.Default private Integer totalOrders = 0;
    @Column(name = "on_time_delivery_rate", precision = 5, scale = 2) @Builder.Default private BigDecimal onTimeDeliveryRate = BigDecimal.ZERO;
    @Column(name = "quality_score", precision = 5, scale = 2) @Builder.Default private BigDecimal qualityScore = BigDecimal.ZERO;
    @Column(name = "response_time_hours") @Builder.Default private Integer responseTimeHours = 24;
    @Enumerated(EnumType.STRING) @Column(length = 20) @Builder.Default private SupplierStatus status = SupplierStatus.ACTIVE;
    @Column(name = "contract_start") private LocalDate contractStart;
    @Column(name = "contract_end") private LocalDate contractEnd;
    @Column(name = "payment_terms", length = 100) private String paymentTerms;
    @Column(length = 10) @Builder.Default private String currency = "USD";
    @Column(name = "minimum_order_value") private BigDecimal minimumOrderValue;
    private String notes;
    @Column(length = 500) private String website;
    @Column(name = "tax_id", length = 50) private String taxId;
    @Column(name = "bank_account") private String bankAccount;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    public enum SupplierStatus { ACTIVE, INACTIVE, SUSPENDED, PENDING }
}