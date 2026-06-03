package com.supplychain.warehouse.service;
import com.supplychain.warehouse.dto.WarehouseDTO;
import com.supplychain.warehouse.entity.Warehouse;
import com.supplychain.warehouse.repository.WarehouseRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;
    
    public List<WarehouseDTO> getAll() {
        return warehouseRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    public WarehouseDTO getById(Long id) {
        return warehouseRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }
    
    private WarehouseDTO toDTO(Warehouse w) {
        return WarehouseDTO.builder()
            .id(w.getId())
            .name(w.getName())
            .code(w.getCode())
            .city(w.getCity())
            .country(w.getCountry())
            .capacity(w.getCapacity())
            .currentOccupancy(w.getCurrentOccupancy())
            .occupancyPercent(w.getOccupancyPercent())
            .status(w.getStatus().name())
            .build();
    }
}