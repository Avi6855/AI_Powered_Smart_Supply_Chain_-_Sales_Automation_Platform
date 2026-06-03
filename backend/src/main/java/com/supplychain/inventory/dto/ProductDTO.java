package com.supplychain.inventory.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductDTO {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("name")
    private String name;
    @JsonProperty("sku")
    private String sku;
    @JsonProperty("barcode")
    private String barcode;
    @JsonProperty("categoryId")
    private Long categoryId;
    @JsonProperty("category_name")
    private String categoryName;
    @JsonProperty("supplierId")
    private Long supplierId;
    @JsonProperty("supplierName")
    private String supplierName;
    @JsonProperty("warehouseId")
    private Long warehouseId;
    @JsonProperty("warehouseName")
    private String warehouseName;
    @JsonProperty("description")
    private String description;
    @JsonProperty("unit_price")
    private BigDecimal unitPrice;
    @JsonProperty("costPrice")
    private BigDecimal costPrice;
    @JsonProperty("quantity_in_stock")
    private Integer quantityInStock;
    @JsonProperty("minimumStockLevel")
    private Integer minimumStockLevel;
    @JsonProperty("reorderPoint")
    private Integer reorderPoint;
    @JsonProperty("reorderQuantity")
    private Integer reorderQuantity;
    @JsonProperty("unitOfMeasure")
    private String unitOfMeasure;
    @JsonProperty("weight")
    private BigDecimal weight;
    @JsonProperty("dimensions")
    private String dimensions;
    @JsonProperty("imageUrl")
    private String imageUrl;
    @JsonProperty("isActive")
    private Boolean isActive;
    @JsonProperty("tags")
    private String[] tags;
    @JsonProperty("aiDemandForecast")
    private Integer aiDemandForecast;
    @JsonProperty("aiReorderSuggestion")
    private Boolean aiReorderSuggestion;
    @JsonProperty("isLowStock")
    private Boolean isLowStock;
    @JsonProperty("expiryDate")
    private LocalDate expiryDate;
    @JsonProperty("shelfLocation")
    private String shelfLocation;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
