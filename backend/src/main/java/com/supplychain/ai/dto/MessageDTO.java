package com.supplychain.ai.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String role;
    private String content;
    private Integer tokensUsed;
    private String modelUsed;
    private LocalDateTime createdAt;
}
