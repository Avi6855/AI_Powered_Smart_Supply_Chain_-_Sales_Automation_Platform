package com.supplychain.order.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDTO {
    private Long id;
    @JsonProperty("order_number")
    private String orderNumber;
    @JsonProperty("customer_name")
    private String customerName;
    private String status;
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;
    @JsonProperty("payment_status")
    private String paymentStatus;
    @JsonProperty("payment_method")
    private String paymentMethod;
    private String notes;
    @JsonProperty("shipping_address")
    private String shippingAddress;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> items;
}
