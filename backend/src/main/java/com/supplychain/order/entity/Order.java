package com.supplychain.order.entity;
import com.supplychain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "orders") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "order_number", unique = true, nullable = false) private String orderNumber;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id") private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Enumerated(EnumType.STRING) @Column(length = 30) @Builder.Default private OrderStatus status = OrderStatus.PENDING;
    @Column(name = "order_type", length = 20) @Builder.Default private String orderType = "SALES";
    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2) private BigDecimal totalAmount;
    @Column(name = "discount_amount", precision = 12, scale = 2) @Builder.Default private BigDecimal discountAmount = BigDecimal.ZERO;
    @Column(name = "tax_amount", precision = 12, scale = 2) @Builder.Default private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(name = "shipping_amount", precision = 10, scale = 2) @Builder.Default private BigDecimal shippingAmount = BigDecimal.ZERO;
    @Column(name = "payment_status", length = 20) @Builder.Default private String paymentStatus = "PENDING";
    @Column(name = "payment_method", length = 50) private String paymentMethod;
    @Column(name = "shipping_address") private String shippingAddress;
    private String notes;
    @Column(name = "expected_delivery") private LocalDate expectedDelivery;
    @Column(name = "actual_delivery") private LocalDate actualDelivery;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
    
    public enum OrderStatus { PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED }
}