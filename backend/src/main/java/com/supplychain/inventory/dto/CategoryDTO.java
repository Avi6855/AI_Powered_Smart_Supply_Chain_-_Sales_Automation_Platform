package com.supplychain.inventory.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private String icon;
    private Long parentId;
    private String parentName;
    private Integer sortOrder;
    private Long productCount;
}