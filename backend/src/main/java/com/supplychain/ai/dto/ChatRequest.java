package com.supplychain.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotBlank(message = "Message cannot be blank")
    private String message;
    
    private Long conversationId;
    private String model;
    private String context;
}
