package com.supplychain.order.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String city;
    private String country;
    private String customerType;
    private BigDecimal totalSpent;
    private Integer totalOrders;
    private String status;
}