package com.supplychain.procurement.entity;
import com.supplychain.auth.entity.User;
import com.supplychain.supplier.entity.Supplier;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "purchase_orders") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "po_number", unique = true, nullable = false) private String poNumber;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "supplier_id") private Supplier supplier;
    @Enumerated(EnumType.STRING) @Column(length = 30) @Builder.Default private POStatus status = POStatus.DRAFT;
    @Column(name = "total_amount", nullable = false) private BigDecimal totalAmount;
    @Column(length = 10) @Builder.Default private String currency = "USD";
    @Column(name = "expected_delivery") private LocalDate expectedDelivery;
    @Column(name = "actual_delivery") private LocalDate actualDelivery;
    @Column(name = "payment_terms", length = 100) private String paymentTerms;
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by") private User createdBy;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "approved_by") private User approvedBy;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    public enum POStatus { DRAFT, SUBMITTED, APPROVED, REJECTED, IN_PROGRESS, RECEIVED, CANCELLED }
}