package com.supplychain.inventory.entity;
import com.supplychain.supplier.entity.Supplier;
import com.supplychain.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "products") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 300) private String name;
    @Column(unique = true, nullable = false, length = 100) private String sku;
    @Column(unique = true, length = 100) private String barcode;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "category_id") private Category category;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "supplier_id") private Supplier supplier;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "warehouse_id") private Warehouse warehouse;
    private String description;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(name = "cost_price", precision = 12, scale = 2) private BigDecimal costPrice;
    @Column(name = "quantity_in_stock") @Builder.Default private Integer quantityInStock = 0;
    @Column(name = "minimum_stock_level") @Builder.Default private Integer minimumStockLevel = 10;
    @Column(name = "reorder_point") @Builder.Default private Integer reorderPoint = 20;
    @Column(name = "reorder_quantity") @Builder.Default private Integer reorderQuantity = 100;
    @Column(name = "unit_of_measure", length = 30) @Builder.Default private String unitOfMeasure = "UNIT";
    @Column(precision = 8, scale = 3) private BigDecimal weight;
    @Column(length = 100) private String dimensions;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;
    @Column(name = "tags", columnDefinition = "text[]") private String[] tags;
    @Column(name = "ai_demand_forecast") private Integer aiDemandForecast;
    @Column(name = "ai_reorder_suggestion") @Builder.Default private Boolean aiReorderSuggestion = false;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    @Column(name = "shelf_location") private String shelfLocation;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    public boolean isLowStock() {
        return quantityInStock != null && reorderPoint != null && quantityInStock <= reorderPoint;
    }
}