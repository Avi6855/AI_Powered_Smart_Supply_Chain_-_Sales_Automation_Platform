package com.supplychain.order.controller;
import com.supplychain.order.dto.CustomerDTO;
import com.supplychain.order.service.CustomerService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/customers") @RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CustomerDTO>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomers(pageable)));
    }
}