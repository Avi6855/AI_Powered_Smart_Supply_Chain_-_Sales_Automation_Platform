package com.supplychain.shipment.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ShipmentDTO {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("trackingNumber")
    private String trackingNumber;
    @JsonProperty("orderId")
    private Long orderId;
    @JsonProperty("orderNumber")
    private String orderNumber;
    @JsonProperty("carrier")
    private String carrier;
    @JsonProperty("status")
    private String status;
    @JsonProperty("destinationAddress")
    private String destinationAddress;
    @JsonProperty("estimatedDelivery")
    private LocalDate estimatedDelivery;
    @JsonProperty("currentLocation")
    private String currentLocation;
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    public ShipmentDTO() {}

    public static ShipmentDTOBuilder builder() {
        return new ShipmentDTOBuilder();
    }

    public static class ShipmentDTOBuilder {
        private final ShipmentDTO instance = new ShipmentDTO();
        public ShipmentDTOBuilder id(Long id) { instance.setId(id); return this; }
        public ShipmentDTOBuilder trackingNumber(String trackingNumber) { instance.setTrackingNumber(trackingNumber); return this; }
        public ShipmentDTOBuilder orderId(Long orderId) { instance.setOrderId(orderId); return this; }
        public ShipmentDTOBuilder orderNumber(String orderNumber) { instance.setOrderNumber(orderNumber); return this; }
        public ShipmentDTOBuilder carrier(String carrier) { instance.setCarrier(carrier); return this; }
        public ShipmentDTOBuilder status(String status) { instance.setStatus(status); return this; }
        public ShipmentDTOBuilder destinationAddress(String destinationAddress) { instance.setDestinationAddress(destinationAddress); return this; }
        public ShipmentDTOBuilder estimatedDelivery(LocalDate estimatedDelivery) { instance.setEstimatedDelivery(estimatedDelivery); return this; }
        public ShipmentDTOBuilder currentLocation(String currentLocation) { instance.setCurrentLocation(currentLocation); return this; }
        public ShipmentDTOBuilder createdAt(LocalDateTime createdAt) { instance.setCreatedAt(createdAt); return this; }
        public ShipmentDTOBuilder updatedAt(LocalDateTime updatedAt) { instance.setUpdatedAt(updatedAt); return this; }
        public ShipmentDTO build() { return instance; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    public LocalDate getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDate estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
