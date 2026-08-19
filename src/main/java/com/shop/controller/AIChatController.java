package com.shop.controller;

import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;
import com.shop.entity.User;
import com.shop.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIChatController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(
            @AuthenticationPrincipal User user,
            @RequestBody AIChatRequest request) {
        return ResponseEntity.ok(aiService.chat(user, request));
    }
}
