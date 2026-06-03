package com.supplychain.warehouse.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WarehouseDTO {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String city;
    private String state;
    private String country;
    private Integer capacity;
    private Integer currentOccupancy;
    private Double occupancyPercent;
    private String managerName;
    private String managerEmail;
    private String phone;
    private String status;
    private String type;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long productCount;
}