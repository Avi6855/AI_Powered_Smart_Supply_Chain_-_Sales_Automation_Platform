package com.supplychain.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
@Entity @Table(name = "categories") @Data @Builder @NoArgsConstructor @AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false, length = 100) private String name;
    private String description;
    @Column(length = 7) @Builder.Default private String color = "#6366f1";
    @Column(length = 50) @Builder.Default private String icon = "Package";
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_id") private Category parent;
    @Column(name = "sort_order") @Builder.Default private Integer sortOrder = 0;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}