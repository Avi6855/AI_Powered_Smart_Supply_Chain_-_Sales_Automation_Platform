package com.supplychain.warehouse.repository;
import com.supplychain.warehouse.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByStatus(Warehouse.WarehouseStatus status);
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByCity(String city);
    boolean existsByCode(String code);
}