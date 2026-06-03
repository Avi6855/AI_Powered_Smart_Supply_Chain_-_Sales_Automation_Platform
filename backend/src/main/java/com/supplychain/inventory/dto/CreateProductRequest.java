package com.supplychain.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request body for creating a new product.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must be at most 255 characters")
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must be at most 100 characters")
    private String sku;

    @Size(max = 100, message = "Barcode must be at most 100 characters")
    private String barcode;

    private Long categoryId;
    private Long supplierId;
    private Long warehouseId;

    private String description;

    @DecimalMin(value = "0.00", message = "Unit price must be non-negative")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.00", message = "Cost price must be non-negative")
    private BigDecimal costPrice;

    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantityInStock;

    @Min(value = 0, message = "Minimum stock level must be non-negative")
    private Integer minimumStockLevel;

    @Min(value = 0, message = "Reorder point must be non-negative")
    private Integer reorderPoint;

    @Min(value = 0, message = "Reorder quantity must be non-negative")
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
