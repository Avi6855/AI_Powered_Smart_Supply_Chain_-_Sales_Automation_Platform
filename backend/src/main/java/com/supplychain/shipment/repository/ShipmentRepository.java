package com.supplychain.shipment.repository;
import com.supplychain.shipment.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Page<Shipment> findByStatus(Shipment.ShipmentStatus status, Pageable pageable);
    Page<Shipment> findByTrackingNumberContainingIgnoreCase(String trackingNumber, Pageable pageable);
}