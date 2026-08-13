package com.shop.service.impl;

import com.shop.dto.ProductResponse;
import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;
import com.shop.dto.ai.AICriteria;
import com.shop.entity.Category;
import com.shop.repository.CategoryRepository;
import com.shop.service.AIService;
import com.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final ChatClient.Builder chatClientBuilder;
    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @Override
    public AIChatResponse chat(AIChatRequest request) {
        ChatClient chatClient = chatClientBuilder.build();

        BeanOutputConverter<AICriteria> converter = new BeanOutputConverter<>(AICriteria.class);

        String systemPrompt = """
                Bạn là một trợ lý bán hàng AI.
                Nhiệm vụ của bạn là phân tích yêu cầu mua hàng của người dùng và trích xuất các tiêu chí tìm kiếm.
                KHÔNG ĐƯỢC tự tạo ra sản phẩm. Chỉ phân tích và trả về đúng định dạng JSON.
                
                {format}
                """;

        PromptTemplate template = new PromptTemplate(systemPrompt, Map.of("format", converter.getFormat()));

        // Gửi yêu cầu tới Gemini
        String aiResponse = chatClient.prompt()
                .system(template.render())
                .user(request.getMessage())
                .call()
                .content();

        // Parse kết quả JSON về object AICriteria
        AICriteria criteria;
        try {
            criteria = converter.convert(aiResponse);
        } catch (Exception e) {
            // Fallback nếu AI trả về JSON lỗi
            return AIChatResponse.builder()
                    .message("Xin lỗi, mình chưa hiểu rõ yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn không?")
                    .products(List.of())
                    .build();
        }

        // Tìm Category ID nếu AI trả về categoryName
        Long categoryId = null;
        if (criteria != null && criteria.getCategoryName() != null && !criteria.getCategoryName().isBlank()) {
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
                criteria != null ? criteria.getKeywords() : null,
                categoryId,
                criteria != null ? criteria.getMinPrice() : null,
                criteria != null ? criteria.getMaxPrice() : null,
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
    }
}
