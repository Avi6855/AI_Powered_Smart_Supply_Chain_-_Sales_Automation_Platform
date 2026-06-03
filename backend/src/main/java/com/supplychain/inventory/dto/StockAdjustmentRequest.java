package com.supplychain.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for manually adjusting stock quantity of a product.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;

    @NotBlank(message = "Reason is required")
    private String reason;

    /** Transaction type: ADJUSTMENT, DAMAGED, EXPIRED, RETURN */
    private String transactionType;

    private Long warehouseId;

    private String notes;
}
