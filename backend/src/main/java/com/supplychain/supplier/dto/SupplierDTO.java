package com.supplychain.supplier.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SupplierDTO {
    private Long id;
    private String name;
    private String code;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private BigDecimal rating;
    private BigDecimal performanceScore;
    private Integer totalOrders;
    private BigDecimal onTimeDeliveryRate;
    private BigDecimal qualityScore;
    private Integer responseTimeHours;
    private String status;
    private LocalDate contractStart;
    private LocalDate contractEnd;
    private String paymentTerms;
    private String currency;
    private BigDecimal minimumOrderValue;
    private String notes;
    private String website;
    private String taxId;
    private String bankAccount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}