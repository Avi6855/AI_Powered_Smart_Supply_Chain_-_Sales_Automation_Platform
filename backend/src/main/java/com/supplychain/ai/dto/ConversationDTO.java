package com.supplychain.ai.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private String title;
    private String contextType;
    private Long messageCount;
    private MessageDTO lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
