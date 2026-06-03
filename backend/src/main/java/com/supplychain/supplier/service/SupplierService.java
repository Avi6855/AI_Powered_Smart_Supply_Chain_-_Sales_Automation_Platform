package com.supplychain.supplier.service;
import com.supplychain.supplier.dto.SupplierDTO;
import com.supplychain.supplier.dto.SupplierUpsertRequest;
import com.supplychain.supplier.entity.Supplier;
import com.supplychain.supplier.repository.SupplierRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;
    
    public PagedResponse<SupplierDTO> getSuppliers(String search, String status, Pageable pageable) {
        Page<Supplier> page;
        if (search != null && !search.isEmpty()) {
            page = supplierRepository.findByNameContainingIgnoreCase(search, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                page = supplierRepository.findByStatus(Supplier.SupplierStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                page = supplierRepository.findAll(pageable);
            }
        } else {
            page = supplierRepository.findAll(pageable);
        }
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
    }
    
    public SupplierDTO getSupplierById(Long id) {
        return supplierRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier", "id", id);
        }
        supplierRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public SupplierDTO createSupplier(SupplierUpsertRequest req) {
        Supplier s = new Supplier();
        apply(s, req);
        return toDTO(supplierRepository.save(s));
    }

    @org.springframework.transaction.annotation.Transactional
    public SupplierDTO updateSupplier(Long id, SupplierUpsertRequest req) {
        Supplier s = supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        apply(s, req);
        return toDTO(supplierRepository.save(s));
    }

    private void apply(Supplier s, SupplierUpsertRequest req) {
        if (req.getName() != null) s.setName(req.getName().trim());
        if (req.getCode() != null) s.setCode(req.getCode().trim());
        if (req.getEmail() != null) s.setEmail(req.getEmail());
        if (req.getPhone() != null) s.setPhone(req.getPhone());
        if (req.getAddress() != null) s.setAddress(req.getAddress());
        if (req.getCity() != null) s.setCity(req.getCity());
        if (req.getCountry() != null) s.setCountry(req.getCountry());
        if (req.getRating() != null) s.setRating(req.getRating());
        if (req.getPerformanceScore() != null) s.setPerformanceScore(req.getPerformanceScore());
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try {
                s.setStatus(Supplier.SupplierStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
    }
    
    private SupplierDTO toDTO(Supplier supplier) {
        return SupplierDTO.builder()
            .id(supplier.getId())
            .name(supplier.getName())
            .code(supplier.getCode())
            .email(supplier.getEmail())
            .phone(supplier.getPhone())
            .address(supplier.getAddress())
            .city(supplier.getCity())
            .country(supplier.getCountry())
            .rating(supplier.getRating())
            .performanceScore(supplier.getPerformanceScore())
            .status(supplier.getStatus().name())
            .build();
    }
}
