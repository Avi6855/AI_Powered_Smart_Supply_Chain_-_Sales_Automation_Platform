package com.supplychain.order.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "customers") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(length = 100) private String email;
    @Column(length = 30) private String phone;
    private String address;
    @Column(length = 100) private String city;
    @Column(length = 100) private String state;
    @Column(length = 100) private String country;
    @Column(length = 20) private String postalCode;
    @Enumerated(EnumType.STRING) @Column(name = "customer_type", length = 30) @Builder.Default private CustomerType customerType = CustomerType.RETAIL;
    @Column(name = "credit_limit", precision = 12, scale = 2) @Builder.Default private BigDecimal creditLimit = new BigDecimal("10000.00");
    @Column(name = "total_orders") @Builder.Default private Integer totalOrders = 0;
    @Column(name = "total_spent", precision = 14, scale = 2) @Builder.Default private BigDecimal totalSpent = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING) @Column(length = 20) @Builder.Default private CustomerStatus status = CustomerStatus.ACTIVE;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    
    public enum CustomerType { RETAIL, WHOLESALE, ENTERPRISE, VIP }
    public enum CustomerStatus { ACTIVE, INACTIVE, SUSPENDED }
}