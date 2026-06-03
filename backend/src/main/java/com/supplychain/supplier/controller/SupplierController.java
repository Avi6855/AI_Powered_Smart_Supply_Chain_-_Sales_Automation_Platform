package com.supplychain.supplier.controller;
import com.supplychain.supplier.dto.SupplierDTO;
import com.supplychain.supplier.dto.SupplierUpsertRequest;
import com.supplychain.supplier.service.SupplierService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/suppliers") @RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SupplierDTO>>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSuppliers(search, status, pageable)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDTO>> create(@RequestBody SupplierUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.createSupplier(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO>> update(@PathVariable Long id, @RequestBody SupplierUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.updateSupplier(id, req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
