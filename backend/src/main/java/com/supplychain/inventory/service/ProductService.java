package com.supplychain.inventory.service;
import com.supplychain.inventory.dto.CreateProductRequest;
import com.supplychain.inventory.dto.ProductDTO;
import com.supplychain.inventory.dto.UpdateProductRequest;
import com.supplychain.inventory.entity.Product;
import com.supplychain.inventory.repository.CategoryRepository;
import com.supplychain.inventory.repository.ProductRepository;
import com.supplychain.supplier.repository.SupplierRepository;
import com.supplychain.warehouse.repository.WarehouseRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    
    @Transactional(readOnly = true)
    public PagedResponse<ProductDTO> getProducts(String search, Long categoryId, Pageable pageable) {
        Page<Product> page;
        if (categoryId != null) {
            page = productRepository.findByCategoryId(categoryId, pageable);
        } else if (search != null && !search.isEmpty()) {
            page = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
    }
    
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStock(Pageable.unpaged()).getContent()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .barcode(request.getBarcode())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .costPrice(request.getCostPrice())
                .quantityInStock(request.getQuantityInStock())
                .minimumStockLevel(request.getMinimumStockLevel())
                .reorderPoint(request.getReorderPoint())
                .reorderQuantity(request.getReorderQuantity())
                .unitOfMeasure(request.getUnitOfMeasure())
                .weight(request.getWeight())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        }
        if (request.getSupplierId() != null) {
            product.setSupplier(supplierRepository.findById(request.getSupplierId()).orElse(null));
        }
        if (request.getWarehouseId() != null) {
            product.setWarehouse(warehouseRepository.findById(request.getWarehouseId()).orElse(null));
        }

        return toDTO(productRepository.save(product));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getBarcode() != null) product.setBarcode(request.getBarcode());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) product.setUnitPrice(request.getUnitPrice());
        if (request.getCostPrice() != null) product.setCostPrice(request.getCostPrice());
        if (request.getMinimumStockLevel() != null) product.setMinimumStockLevel(request.getMinimumStockLevel());
        if (request.getReorderPoint() != null) product.setReorderPoint(request.getReorderPoint());
        if (request.getReorderQuantity() != null) product.setReorderQuantity(request.getReorderQuantity());
        if (request.getUnitOfMeasure() != null) product.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        }
        if (request.getSupplierId() != null) {
            product.setSupplier(supplierRepository.findById(request.getSupplierId()).orElse(null));
        }
        if (request.getWarehouseId() != null) {
            product.setWarehouse(warehouseRepository.findById(request.getWarehouseId()).orElse(null));
        }

        return toDTO(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
    }
    
    public ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
            .id(p.getId()).name(p.getName()).sku(p.getSku())
            .barcode(p.getBarcode()).description(p.getDescription())
            .unitPrice(p.getUnitPrice()).costPrice(p.getCostPrice())
            .quantityInStock(p.getQuantityInStock()).minimumStockLevel(p.getMinimumStockLevel())
            .reorderPoint(p.getReorderPoint()).reorderQuantity(p.getReorderQuantity())
            .unitOfMeasure(p.getUnitOfMeasure()).weight(p.getWeight())
            .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
            .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
            .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
            .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
            .warehouseId(p.getWarehouse() != null ? p.getWarehouse().getId() : null)
            .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : null)
            .isActive(p.getIsActive()).isLowStock(p.isLowStock())
            .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
            .build();
    }
}
