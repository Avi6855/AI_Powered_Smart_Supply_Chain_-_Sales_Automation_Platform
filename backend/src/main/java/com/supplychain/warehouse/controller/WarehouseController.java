package com.supplychain.warehouse.controller;
import com.supplychain.warehouse.dto.WarehouseDTO;
import com.supplychain.warehouse.service.WarehouseService;
import com.supplychain.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/warehouses") @RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService warehouseService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<WarehouseDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getAll()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getById(id)));
    }
}