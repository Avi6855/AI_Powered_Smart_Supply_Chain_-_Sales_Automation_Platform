package com.supplychain.order.controller;
import com.supplychain.order.dto.OrderDTO;
import com.supplychain.order.dto.OrderUpsertRequest;
import com.supplychain.order.service.OrderService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrders(search, status, pageable)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> create(@RequestBody OrderUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(orderService.createOrder(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> update(@PathVariable Long id, @RequestBody OrderUpsertRequest req) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrder(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateStatus(id, body.get("status"))));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
