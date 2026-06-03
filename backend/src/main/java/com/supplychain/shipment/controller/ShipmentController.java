package com.supplychain.shipment.controller;
import com.supplychain.shipment.dto.ShipmentDTO;
import com.supplychain.shipment.service.ShipmentService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/shipments") @RequiredArgsConstructor
public class ShipmentController {
    private final ShipmentService shipmentService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ShipmentDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getShipments(search, status, pageable)));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentDTO>> create(@RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.createShipment(dto)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDTO>> update(@PathVariable Long id, @RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.updateShipment(id, dto)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}