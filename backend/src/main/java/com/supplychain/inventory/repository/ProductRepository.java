package com.supplychain.inventory.repository;
import com.supplychain.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<Product> findBySupplierId(Long supplierId, Pageable pageable);
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    @Query("SELECT p FROM Product p WHERE p.quantityInStock <= p.reorderPoint AND p.isActive = true")
    Page<Product> findLowStock(Pageable pageable);
    List<Product> findByAiReorderSuggestionTrue();
    Long countByCategoryId(Long categoryId);
}