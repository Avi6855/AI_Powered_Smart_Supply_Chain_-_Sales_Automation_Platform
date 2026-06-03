package com.supplychain.supplier.repository;
import com.supplychain.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Page<Supplier> findByStatus(Supplier.SupplierStatus status, Pageable pageable);
    Page<Supplier> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Supplier> findByCode(String code);
    boolean existsByCode(String code);
    List<Supplier> findTop10ByOrderByPerformanceScoreDesc();
    List<Supplier> findByCountry(String country);
    @Query(value = """
        SELECT *
        FROM suppliers s
        WHERE s.contract_end <= CURRENT_DATE + INTERVAL '30 days'
        """, nativeQuery = true)
    List<Supplier> findExpiringContracts();
}