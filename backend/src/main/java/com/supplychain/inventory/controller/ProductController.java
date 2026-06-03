package com.supplychain.inventory.controller;
import com.supplychain.inventory.dto.ProductDTO;
import com.supplychain.inventory.dto.CreateProductRequest;
import com.supplychain.inventory.dto.UpdateProductRequest;
import com.supplychain.inventory.service.ProductService;
import com.supplychain.common.response.ApiResponse;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/products") @RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductDTO>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProducts(search, category, pageable)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(request)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> update(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, request)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}