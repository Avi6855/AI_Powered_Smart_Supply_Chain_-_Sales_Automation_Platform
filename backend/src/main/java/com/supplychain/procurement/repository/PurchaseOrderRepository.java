package com.supplychain.procurement.repository;
import com.supplychain.procurement.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Page<PurchaseOrder> findByStatus(PurchaseOrder.POStatus status, Pageable pageable);
    Page<PurchaseOrder> findByPoNumberContainingIgnoreCase(String poNumber, Pageable pageable);
} 