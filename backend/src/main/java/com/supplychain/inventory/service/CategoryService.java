package com.supplychain.inventory.service;
import com.supplychain.inventory.dto.CategoryDTO;
import com.supplychain.inventory.entity.Category;
import com.supplychain.inventory.repository.CategoryRepository;
import com.supplychain.inventory.repository.ProductRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    
    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    public CategoryDTO getById(Long id) {
        return categoryRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
    
    private CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .color(category.getColor())
            .icon(category.getIcon())
            .parentId(category.getParent() != null ? category.getParent().getId() : null)
            .parentName(category.getParent() != null ? category.getParent().getName() : null)
            .sortOrder(category.getSortOrder())
            .productCount(productRepository.countByCategoryId(category.getId()))
            .build();
    }
}