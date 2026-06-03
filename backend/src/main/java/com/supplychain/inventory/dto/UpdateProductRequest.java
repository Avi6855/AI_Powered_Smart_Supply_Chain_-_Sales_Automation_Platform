package com.supplychain.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for updating an existing product.
 * All fields are optional – only non-null values will be applied.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    private String name;
    private String barcode;
    private Long categoryId;
    private Long supplierId;
    private Long warehouseId;
    private String description;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer minimumStockLevel;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private String unitOfMeasure;
    private BigDecimal weight;
    private String dimensions;
    private String imageUrl;
    private Boolean isActive;
    private String[] tags;
    private LocalDate expiryDate;
    private String shelfLocation;
}
