package com.shop.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIChatRequest {
    private String message;
    private List<AIChatMessageDto> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIChatMessageDto {
        private String sender; // "AI" or "USER"
        private String text;
    }
}
