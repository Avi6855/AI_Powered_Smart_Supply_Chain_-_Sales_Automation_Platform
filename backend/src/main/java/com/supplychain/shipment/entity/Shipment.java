package com.supplychain.shipment.entity;
import com.supplychain.order.entity.Order;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "shipments") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "tracking_number", unique = true, nullable = false) private String trackingNumber;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id") private Order order;
    @Column(length = 100) private String carrier;
    @Enumerated(EnumType.STRING) @Column(length = 30) @Builder.Default private ShipmentStatus status = ShipmentStatus.PENDING;
    @Column(name = "origin_address") private String originAddress;
    @Column(name = "destination_address") private String destinationAddress;
    @Column(precision = 8, scale = 3) private BigDecimal weight;
    @Column(name = "shipping_cost") private BigDecimal shippingCost;
    @Column(name = "estimated_delivery") private LocalDate estimatedDelivery;
    @Column(name = "actual_delivery") private LocalDateTime actualDelivery;
    @Column(name = "current_location") private String currentLocation;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    
    public enum ShipmentStatus { PENDING, PROCESSING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, EXCEPTION, RETURNED }
}