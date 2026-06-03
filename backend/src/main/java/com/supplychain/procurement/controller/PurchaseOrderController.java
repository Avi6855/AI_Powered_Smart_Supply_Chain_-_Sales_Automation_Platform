package com.supplychain.procurement.controller;
import com.supplychain.procurement.dto.PurchaseOrderDTO;
import com.supplychain.procurement.dto.PurchaseOrderUpsertRequest;
import com.supplychain.procurement.service.PurchaseOrderService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/purchase-orders") @RequiredArgsConstructor
public class PurchaseOrderController {
    private final PurchaseOrderService poService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(poService.getPurchaseOrders(search, status, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> create(@RequestBody PurchaseOrderUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(poService.createPurchaseOrder(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> update(@PathVariable Long id, @RequestBody PurchaseOrderUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(poService.updatePurchaseOrder(id, req)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(poService.approve(id)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        poService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
