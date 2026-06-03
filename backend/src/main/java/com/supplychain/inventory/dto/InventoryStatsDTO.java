package com.supplychain.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Aggregated inventory statistics for dashboard widgets.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatsDTO {

    private long totalProducts;
    private long activeProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private BigDecimal totalInventoryValue;
    private BigDecimal averageUnitPrice;
    private long totalCategories;
    private long totalWarehouses;
    private List<Map<String, Object>> categoryBreakdown;
    private List<Map<String, Object>> warehouseOccupancy;
    private List<ProductDTO> criticalStockItems;
}
