package com.supplychain.inventory.repository;
import com.supplychain.inventory.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Page<InventoryTransaction> findByProductId(Long productId, Pageable pageable);
    Page<InventoryTransaction> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<InventoryTransaction> findByTransactionType(InventoryTransaction.TransactionType type, Pageable pageable);
    Page<InventoryTransaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}