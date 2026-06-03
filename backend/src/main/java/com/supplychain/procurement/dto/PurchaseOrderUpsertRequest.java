package com.supplychain.procurement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderUpsertRequest {
    @NotBlank
    private String poNumber;

    private Long supplierId;

    private String status;

    @DecimalMin("0.00")
    private BigDecimal totalAmount;

    private LocalDate expectedDelivery;

    private String notes;
}

