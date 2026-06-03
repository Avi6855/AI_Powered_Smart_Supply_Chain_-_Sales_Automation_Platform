package com.supplychain.shipment.service;
import com.supplychain.shipment.dto.ShipmentDTO;
import com.supplychain.shipment.entity.Shipment;
import com.supplychain.shipment.repository.ShipmentRepository;
import com.supplychain.order.repository.OrderRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    
    @Transactional(readOnly = true)
    public PagedResponse<ShipmentDTO> getShipments(String search, String status, Pageable pageable) {
        Page<Shipment> page;
        if (search != null && !search.isEmpty()) {
            page = shipmentRepository.findByTrackingNumberContainingIgnoreCase(search, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                page = shipmentRepository.findByStatus(Shipment.ShipmentStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                page = shipmentRepository.findAll(pageable);
            }
        } else {
            page = shipmentRepository.findAll(pageable);
        }
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @Transactional
    public ShipmentDTO createShipment(ShipmentDTO dto) {
        Shipment s = Shipment.builder()
            .trackingNumber(dto.getTrackingNumber())
            .carrier(dto.getCarrier())
            .status(Shipment.ShipmentStatus.valueOf(dto.getStatus()))
            .destinationAddress(dto.getDestinationAddress())
            .estimatedDelivery(dto.getEstimatedDelivery())
            .currentLocation(dto.getCurrentLocation())
            .build();
        
        if (dto.getOrderId() != null) {
            s.setOrder(orderRepository.findById(dto.getOrderId()).orElse(null));
        }
        
        return toDTO(shipmentRepository.save(s));
    }

    @Transactional
    public ShipmentDTO updateShipment(Long id, ShipmentDTO dto) {
        Shipment s = shipmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", id));
        
        if (dto.getTrackingNumber() != null) s.setTrackingNumber(dto.getTrackingNumber());
        if (dto.getCarrier() != null) s.setCarrier(dto.getCarrier());
        if (dto.getStatus() != null) s.setStatus(Shipment.ShipmentStatus.valueOf(dto.getStatus()));
        if (dto.getDestinationAddress() != null) s.setDestinationAddress(dto.getDestinationAddress());
        if (dto.getEstimatedDelivery() != null) s.setEstimatedDelivery(dto.getEstimatedDelivery());
        if (dto.getCurrentLocation() != null) s.setCurrentLocation(dto.getCurrentLocation());

        if (dto.getOrderId() != null) {
            s.setOrder(orderRepository.findById(dto.getOrderId()).orElse(null));
        }

        return toDTO(shipmentRepository.save(s));
    }

    @Transactional
    public void deleteShipment(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shipment", "id", id);
        }
        shipmentRepository.deleteById(id);
    }
    
    private ShipmentDTO toDTO(Shipment s) {
        return ShipmentDTO.builder()
            .id(s.getId()).trackingNumber(s.getTrackingNumber())
            .orderId(s.getOrder() != null ? s.getOrder().getId() : null)
            .orderNumber(s.getOrder() != null ? s.getOrder().getOrderNumber() : null)
            .carrier(s.getCarrier()).status(s.getStatus().name())
            .destinationAddress(s.getDestinationAddress())
            .estimatedDelivery(s.getEstimatedDelivery())
            .currentLocation(s.getCurrentLocation())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
