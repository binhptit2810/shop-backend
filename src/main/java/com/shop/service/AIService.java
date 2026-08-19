package com.shop.service;

import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;
import com.shop.entity.User;

public interface AIService {
    AIChatResponse chat(User user, AIChatRequest request);
}
