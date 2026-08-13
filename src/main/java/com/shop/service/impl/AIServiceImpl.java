package com.shop.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.dto.ProductResponse;
import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;
import com.shop.dto.ai.AICriteria;
import com.shop.entity.Category;
import com.shop.repository.CategoryRepository;
import com.shop.service.AIService;
import com.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    @Value("${spring.ai.openai.api-key}")
    private String geminiApiKey;

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AIChatResponse chat(AIChatRequest request) {
        String systemPrompt = """
                Bạn là một trợ lý bán hàng AI.
                Nhiệm vụ của bạn là phân tích yêu cầu mua hàng của người dùng và trích xuất các tiêu chí tìm kiếm.
                Chỉ phân tích và trả về đúng định dạng JSON, KHÔNG Markdown, KHÔNG chú thích.
                
                Định dạng JSON:
                {
                  "keywords": "string",
                  "categoryName": "string",
                  "minPrice": number,
                  "maxPrice": number
                }
                """;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = objectMapper.writeValueAsString(
                Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", request.getMessage())))),
                    "generationConfig", Map.of("response_mime_type", "application/json")
                )
            );

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            Map response = restTemplate.postForObject(url, entity, Map.class);
            
            // Extract the text from the response
            List candidates = (List) response.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            Map firstPart = (Map) parts.get(0);
            String aiResponseText = (String) firstPart.get("text");

            AICriteria criteria = objectMapper.readValue(aiResponseText, AICriteria.class);

            // Tìm Category ID nếu AI trả về categoryName
            Long categoryId = null;
            if (criteria.getCategoryName() != null && !criteria.getCategoryName().isBlank()) {
                List<Category> allCategories = categoryRepository.findAll();
                for (Category cat : allCategories) {
                    if (cat.getName().toLowerCase().contains(criteria.getCategoryName().toLowerCase())) {
                        categoryId = cat.getId();
                        break;
                    }
                }
            }

            // Truy vấn database thật qua ProductService
            List<ProductResponse> products = productService.searchProducts(
                    criteria.getKeywords(),
                    categoryId,
                    criteria.getMinPrice(),
                    criteria.getMaxPrice(),
                    "createdAt", 0, 5
            );

            String message;
            if (products.isEmpty()) {
                message = "Mình chưa tìm thấy sản phẩm nào hoàn toàn phù hợp với yêu cầu của bạn. Bạn thử thay đổi tiêu chí xem sao nhé.";
            } else {
                message = "Mình tìm thấy " + products.size() + " sản phẩm phù hợp với nhu cầu của bạn đây!";
            }

            return AIChatResponse.builder()
                    .message(message)
                    .products(products)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return AIChatResponse.builder()
                    .message("Xin lỗi, mình chưa hiểu rõ yêu cầu của bạn hoặc có lỗi kết nối. Bạn có thể mô tả chi tiết hơn không?")
                    .products(List.of())
                    .build();
        }
    }
}

