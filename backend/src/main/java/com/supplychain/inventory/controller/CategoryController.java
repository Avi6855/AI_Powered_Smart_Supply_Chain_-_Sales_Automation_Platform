package com.supplychain.inventory.controller;
import com.supplychain.inventory.dto.CategoryDTO;
import com.supplychain.inventory.service.CategoryService;
import com.supplychain.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/categories") @RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAll()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getById(id)));
    }
}