package com.supplychain.procurement.service;
import com.supplychain.procurement.dto.PurchaseOrderDTO;
import com.supplychain.procurement.dto.PurchaseOrderUpsertRequest;
import com.supplychain.procurement.entity.PurchaseOrder;
import com.supplychain.procurement.repository.PurchaseOrderRepository;
import com.supplychain.common.response.PagedResponse;
import com.supplychain.supplier.entity.Supplier;
import com.supplychain.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service @RequiredArgsConstructor
public class PurchaseOrderService {
    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderDTO> getPurchaseOrders(String search, String status, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (search != null && !search.isEmpty()) {
            page = poRepository.findByPoNumberContainingIgnoreCase(search, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                page = poRepository.findByStatus(PurchaseOrder.POStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                page = poRepository.findAll(pageable);
            }
        } else {
            page = poRepository.findAll(pageable);
        }
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void deletePurchaseOrder(Long id) {
        if (!poRepository.existsById(id)) {
            throw new com.supplychain.common.exception.ResourceNotFoundException("PurchaseOrder", "id", id);
        }
        poRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderUpsertRequest req) {
        PurchaseOrder po = new PurchaseOrder();
        apply(po, req);
        return toDTO(poRepository.save(po));
    }

    @org.springframework.transaction.annotation.Transactional
    public PurchaseOrderDTO updatePurchaseOrder(Long id, PurchaseOrderUpsertRequest req) {
        PurchaseOrder po = poRepository.findById(id)
            .orElseThrow(() -> new com.supplychain.common.exception.ResourceNotFoundException("PurchaseOrder", "id", id));
        apply(po, req);
        return toDTO(poRepository.save(po));
    }

    @org.springframework.transaction.annotation.Transactional
    public PurchaseOrderDTO approve(Long id) {
        PurchaseOrder po = poRepository.findById(id)
            .orElseThrow(() -> new com.supplychain.common.exception.ResourceNotFoundException("PurchaseOrder", "id", id));
        po.setStatus(PurchaseOrder.POStatus.APPROVED);
        return toDTO(poRepository.save(po));
    }

    private void apply(PurchaseOrder po, PurchaseOrderUpsertRequest req) {
        if (req.getPoNumber() != null && !req.getPoNumber().isBlank()) po.setPoNumber(req.getPoNumber().trim());
        if (req.getTotalAmount() != null) po.setTotalAmount(req.getTotalAmount());
        else if (po.getTotalAmount() == null) po.setTotalAmount(BigDecimal.ZERO);
        if (req.getExpectedDelivery() != null) po.setExpectedDelivery(req.getExpectedDelivery());
        if (req.getNotes() != null) po.setNotes(req.getNotes());

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try {
                po.setStatus(PurchaseOrder.POStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        if (req.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new com.supplychain.common.exception.ResourceNotFoundException("Supplier", "id", req.getSupplierId()));
            po.setSupplier(supplier);
        }
    }
    
    private PurchaseOrderDTO toDTO(PurchaseOrder p) {
        return PurchaseOrderDTO.builder()
            .id(p.getId()).poNumber(p.getPoNumber())
            .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
            .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
            .status(p.getStatus().name()).totalAmount(p.getTotalAmount())
            .expectedDelivery(p.getExpectedDelivery()).createdAt(p.getCreatedAt())
            .build();
    }
}
