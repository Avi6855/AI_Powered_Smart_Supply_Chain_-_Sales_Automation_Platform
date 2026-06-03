package com.supplychain.inventory.entity;
import com.supplychain.auth.entity.User;
import com.supplychain.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "inventory_transactions") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class InventoryTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "warehouse_id") private Warehouse warehouse;
    @Enumerated(EnumType.STRING) @Column(name = "transaction_type", nullable = false) private TransactionType transactionType;
    @Column(name = "quantity_change", nullable = false) private Integer quantityChange;
    @Column(name = "quantity_before", nullable = false) private Integer quantityBefore;
    @Column(name = "quantity_after", nullable = false) private Integer quantityAfter;
    @Column(name = "unit_cost", precision = 12, scale = 2) private BigDecimal unitCost;
    @Column(name = "reference_type", length = 30) private String referenceType;
    @Column(name = "reference_id") private Long referenceId;
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "performed_by") private User performedBy;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    
    public enum TransactionType { INBOUND, OUTBOUND, ADJUSTMENT, TRANSFER, RETURN, DAMAGED, EXPIRED }
}