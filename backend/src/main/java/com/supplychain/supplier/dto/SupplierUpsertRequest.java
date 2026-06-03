package com.supplychain.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierUpsertRequest {
    private String name;
    private String code;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private BigDecimal rating;
    private BigDecimal performanceScore;
    private String status;
}
