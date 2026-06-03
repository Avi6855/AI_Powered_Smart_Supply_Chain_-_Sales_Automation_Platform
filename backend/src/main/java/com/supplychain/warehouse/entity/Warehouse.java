package com.supplychain.warehouse.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "warehouses") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(unique = true, nullable = false, length = 50) private String code;
    @Column(nullable = false) private String address;
    @Column(nullable = false, length = 100) private String city;
    @Column(length = 100) private String state;
    @Column(nullable = false, length = 100) private String country;
    @Column(length = 20) private String postalCode;
    @Column(nullable = false) private Integer capacity;
    @Column(name = "current_occupancy") @Builder.Default private Integer currentOccupancy = 0;
    @Column(name = "manager_name", length = 100) private String managerName;
    @Column(name = "manager_email", length = 100) private String managerEmail;
    @Column(length = 30) private String phone;
    @Enumerated(EnumType.STRING) @Column(length = 20) @Builder.Default private WarehouseStatus status = WarehouseStatus.ACTIVE;
    @Column(precision = 10, scale = 8) private BigDecimal latitude;
    @Column(precision = 11, scale = 8) private BigDecimal longitude;
    @Enumerated(EnumType.STRING) @Column(length = 50) @Builder.Default private WarehouseType type = WarehouseType.GENERAL;
    @Column(name = "operating_hours") private String operatingHours;
    private String notes;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    public enum WarehouseStatus { ACTIVE, INACTIVE, MAINTENANCE }
    public enum WarehouseType { GENERAL, DISTRIBUTION, FULFILLMENT, STORAGE, LOGISTICS, COLD_STORAGE }
    
    public Double getOccupancyPercent() {
        if (capacity == null || capacity == 0) return 0.0;
        return (currentOccupancy * 100.0) / capacity;
    }
}