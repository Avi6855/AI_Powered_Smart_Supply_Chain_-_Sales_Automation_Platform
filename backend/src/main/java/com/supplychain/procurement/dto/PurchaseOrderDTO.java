package com.supplychain.procurement.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PurchaseOrderDTO {
    @JsonProperty("id")
    private Long id;
    @JsonProperty("po_number")
    private String poNumber;
    @JsonProperty("supplierId")
    private Long supplierId;
    @JsonProperty("supplier_name")
    private String supplierName;
    @JsonProperty("status")
    private String status;
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;
    @JsonProperty("expected_delivery")
    private LocalDate expectedDelivery;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    public PurchaseOrderDTO() {}

    public static PurchaseOrderDTOBuilder builder() {
        return new PurchaseOrderDTOBuilder();
    }

    public static class PurchaseOrderDTOBuilder {
        private final PurchaseOrderDTO instance = new PurchaseOrderDTO();
        public PurchaseOrderDTOBuilder id(Long id) { instance.setId(id); return this; }
        public PurchaseOrderDTOBuilder poNumber(String poNumber) { instance.setPoNumber(poNumber); return this; }
        public PurchaseOrderDTOBuilder supplierId(Long supplierId) { instance.setSupplierId(supplierId); return this; }
        public PurchaseOrderDTOBuilder supplierName(String supplierName) { instance.setSupplierName(supplierName); return this; }
        public PurchaseOrderDTOBuilder status(String status) { instance.setStatus(status); return this; }
        public PurchaseOrderDTOBuilder totalAmount(BigDecimal totalAmount) { instance.setTotalAmount(totalAmount); return this; }
        public PurchaseOrderDTOBuilder expectedDelivery(LocalDate expectedDelivery) { instance.setExpectedDelivery(expectedDelivery); return this; }
        public PurchaseOrderDTOBuilder createdAt(LocalDateTime createdAt) { instance.setCreatedAt(createdAt); return this; }
        public PurchaseOrderDTO build() { return instance; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
