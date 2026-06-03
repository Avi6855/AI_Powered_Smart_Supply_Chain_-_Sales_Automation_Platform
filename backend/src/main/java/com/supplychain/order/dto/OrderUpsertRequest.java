package com.supplychain.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpsertRequest {
    @NotBlank
    private String orderNumber;

    private String customerName;

    private String status;

    @DecimalMin("0.00")
    private BigDecimal totalAmount;

    private String paymentStatus;

    private String paymentMethod;

    private String notes;

    private String shippingAddress;
}

