package com.shop.service;

import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;

public interface AIService {
    AIChatResponse chat(AIChatRequest request);
}
