package com.shop.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.dto.ProductResponse;
import com.shop.dto.OrderResponse;
import com.shop.dto.VoucherResponse;
import com.shop.dto.ai.AIChatRequest;
import com.shop.dto.ai.AIChatResponse;
import com.shop.entity.Category;
import com.shop.entity.User;
import com.shop.repository.CategoryRepository;
import com.shop.service.AIService;
import com.shop.service.ProductService;
import com.shop.service.OrderService;
import com.shop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    @Value("${spring.ai.openai.api-key}")
    private String geminiApiKey;

    private final ProductService productService;
    private final OrderService orderService;
    private final VoucherService voucherService;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIResponseParsed {
        private String intent;
        private String reply;
        private String toolName;
        private Map<String, Object> toolArgs;
        private String redirectUrl;
    }

    @Override
    public AIChatResponse chat(User user, AIChatRequest request) {
        boolean isLoggedIn = (user != null);
        String userContext = isLoggedIn 
                ? "Người dùng ĐÃ ĐĂNG NHẬP (Username: " + user.getUsername() + ", Email: " + user.getEmail() + ")." 
                : "Người dùng CHƯA ĐĂNG NHẬP (Anonymous).";

        String systemPrompt = """
                Bạn là một Trợ lý Chăm sóc Khách hàng (Customer Service Assistant) thông minh và thân thiện của trang web thương mại điện tử.
                Nhiệm vụ của bạn là hỗ trợ khách hàng trả lời câu hỏi, tư vấn sản phẩm, hướng dẫn sử dụng hệ thống và hỗ trợ các vấn đề về tài khoản, đơn hàng, thanh toán, voucher.

                QUY TẮC PHÂN LOẠI INTENT VÀ GỌI TOOL:
                1. TƯ VẤN/TÌM SẢN PHẨM (PRODUCT_SEARCH / PRODUCT_RECOMMENDATION / PRODUCT_COMPARE / PRODUCT_INFORMATION):
                   - Khi khách hàng tìm sản phẩm, nhờ giới thiệu sản phẩm.
                   - Gọi tool: "searchProducts" với các tham số: "keywords" (chuỗi), "categoryName" (chuỗi), "minPrice" (số), "maxPrice" (số).
                   - Nếu không tìm kiếm cụ thể mà chỉ so sánh hoặc hỏi han, hãy trả lời thân thiện và vẫn gọi "searchProducts" nếu cần thông tin sản phẩm thật để giới thiệu.
                2. TRA CỨU ĐƠN HÀNG (ORDER_TRACKING):
                   - Khi người dùng hỏi đơn hàng ở đâu, kiểm tra đơn hàng, v.v.
                   - Nếu CHƯA ĐĂNG NHẬP, bắt buộc đặt "reply" yêu cầu người dùng đăng nhập trước và trả về "redirectUrl": "/login", "toolName": null.
                   - Nếu ĐÃ ĐĂNG NHẬP, đặt "toolName": "getMyOrders", "toolArgs": {}.
                3. HỦY ĐƠN HÀNG (ORDER_CANCEL):
                   - Khi người dùng yêu cầu hủy đơn.
                   - Nếu chưa đăng nhập, đặt "reply" yêu cầu đăng nhập và trả về "redirectUrl": "/login".
                   - Nếu đã đăng nhập, kiểm tra xem người dùng đã cung cấp mã đơn hàng chưa. Nếu chưa có mã đơn hàng, hãy yêu cầu người dùng cung cấp mã đơn hàng.
                   - Nếu người dùng yêu cầu hủy đơn hàng cụ thể (ví dụ đơn #12) nhưng chưa xác nhận trong cuộc hội thoại này, hãy hỏi lại: "Bạn có chắc chắn muốn hủy đơn hàng #12 không?".
                   - Chỉ khi người dùng nói "Có", "Đúng vậy", "Đồng ý", "Xác nhận" hoặc đã xác nhận trước đó (kiểm tra lịch sử hội thoại), bạn mới đặt "toolName": "cancelOrder", "toolArgs": {"orderId": 12}.
                4. LẤY MÃ GIẢM GIÁ/VOUCHER (VOUCHER_HELP):
                   - Khi khách hàng hỏi về khuyến mãi, voucher.
                   - Gọi tool: "getActiveVouchers", "toolArgs": {}.
                5. HƯỚNG DẪN TÀI KHOẢN (ACCOUNT_HELP / CHANGE_PASSWORD / FORGOT_PASSWORD / UPDATE_PROFILE / LOGIN_HELP):
                   - Thay đổi mật khẩu (CHANGE_PASSWORD): Hướng dẫn người dùng các bước: Đăng nhập -> Vào Tài khoản cá nhân -> Bảo mật -> Đổi mật khẩu. TUYỆT ĐỐI không bao giờ yêu cầu người dùng cung cấp mật khẩu qua chat. Đặt "toolName": null.
                   - Quên mật khẩu (FORGOT_PASSWORD): Hướng dẫn người dùng sử dụng chức năng "Quên mật khẩu" ở trang đăng nhập. Trả về "redirectUrl": "/forgot-password", "toolName": null.
                   - Cập nhật tài khoản (UPDATE_PROFILE): Hướng dẫn đổi thông tin tại trang Hồ sơ cá nhân. Trả về "redirectUrl": "/profile", "toolName": null.
                6. HỎI ĐÁP FAQ VÀ CHÍNH SÁCH (FAQ / SHIPPING_HELP / RETURN_HELP / WARRANTY_HELP / PAYMENT_HELP / REFUND_HELP):
                   - Chính sách giao hàng (SHIPPING_HELP): Giao từ 2-5 ngày làm việc.
                   - Chính sách đổi trả (RETURN_HELP): Đổi trả trong vòng 7 ngày đối với lỗi từ nhà sản xuất.
                   - Chính sách bảo hành (WARRANTY_HELP): Bảo hành chính hãng 12 tháng.
                   - Trả lời trực tiếp các câu hỏi này trong "reply" bằng tiếng Việt một cách tự nhiên, đặt "toolName": null.
                7. YÊU CẦU GẶP NHÂN VIÊN (HUMAN_SUPPORT):
                   - Khi khách hàng yêu cầu gặp nhân viên, hỗ trợ trực tiếp.
                   - Trả lời: "Dạ mình đã ghi nhận yêu cầu hỗ trợ. Hệ thống sẽ chuyển thông tin đến nhân viên hỗ trợ trực tiếp. Bạn vui lòng đợi trong giây lát." và đặt "intent": "HUMAN_SUPPORT", "toolName": null.

                Định dạng trả về:
                BẮT BUỘC trả về đúng định dạng JSON có cấu trúc sau, KHÔNG Markdown (không bọc trong ```json hay ```):
                {
                  "intent": "TÊN_INTENT",
                  "reply": "Nội dung trả lời thân thiện",
                  "toolName": "tên_tool_nếu_có",
                  "toolArgs": { ... },
                  "redirectUrl": "đường_dẫn_chuyển_hướng_nếu_có"
                }
                
                Lưu ý quan trọng: Không được tự bịa thông tin về sản phẩm, giá cả, hoặc đơn hàng nếu chưa gọi tool tương ứng để lấy dữ liệu thực tế.
                """;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct contents with conversation history
            List<Map<String, Object>> contents = new ArrayList<>();
            if (request.getHistory() != null) {
                for (AIChatRequest.AIChatMessageDto msg : request.getHistory()) {
                    String role = msg.getSender().equalsIgnoreCase("AI") ? "model" : "user";
                    contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", msg.getText()))
                    ));
                }
            }
            
            // Add user message with current context (login state)
            String currentMessageWithContext = userContext + "\nYêu cầu của người dùng: " + request.getMessage();
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", currentMessageWithContext))
            ));

            String requestBody = objectMapper.writeValueAsString(
                Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                    "contents", contents,
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
            aiResponseText = aiResponseText.replaceAll("```json", "").replaceAll("```", "").trim();

            AIResponseParsed parsed = objectMapper.readValue(aiResponseText, AIResponseParsed.class);

            // Response fields mapping
            String finalReply = parsed.getReply();
            String intent = parsed.getIntent();
            String toolName = parsed.getToolName();
            Map<String, Object> toolArgs = parsed.getToolArgs();
            String redirectUrl = parsed.getRedirectUrl();

            List<ProductResponse> products = new ArrayList<>();
            List<OrderResponse> orders = new ArrayList<>();
            List<VoucherResponse> vouchers = new ArrayList<>();

            // Tool Execution logic
            if (toolName != null) {
                try {
                    switch (toolName) {
                        case "searchProducts":
                            String kw = (toolArgs != null && toolArgs.get("keywords") != null) ? toolArgs.get("keywords").toString() : null;
                            String categoryName = (toolArgs != null && toolArgs.get("categoryName") != null) ? toolArgs.get("categoryName").toString() : null;
                            java.math.BigDecimal minPrice = null;
                            java.math.BigDecimal maxPrice = null;
                            
                            if (toolArgs != null) {
                                if (toolArgs.get("minPrice") != null) {
                                    minPrice = new java.math.BigDecimal(toolArgs.get("minPrice").toString());
                                }
                                if (toolArgs.get("maxPrice") != null) {
                                    maxPrice = new java.math.BigDecimal(toolArgs.get("maxPrice").toString());
                                }
                            }
                            
                            Long categoryId = null;
                            if (categoryName != null && !categoryName.isBlank()) {
                                List<Category> allCategories = categoryRepository.findAll();
                                for (Category cat : allCategories) {
                                    if (cat.getName().toLowerCase().contains(categoryName.toLowerCase())) {
                                        categoryId = cat.getId();
                                        break;
                                    }
                                }
                            }
                            
                            products = productService.searchProducts(kw, categoryId, minPrice, maxPrice, "createdAt", 0, 5);
                            if (products.isEmpty() && finalReply.contains("tìm thấy")) {
                                finalReply = "Hiện tại mình chưa tìm thấy sản phẩm nào hoàn toàn phù hợp với yêu cầu của bạn. Bạn thử thay đổi tiêu chí hoặc từ khóa xem sao nhé.";
                            }
                            break;
                            
                        case "getMyOrders":
                            if (isLoggedIn) {
                                orders = orderService.getMyOrders(user);
                                if (orders.isEmpty()) {
                                    finalReply = "Bạn hiện chưa có đơn hàng nào trong hệ thống.";
                                } else {
                                    finalReply = "Dưới đây là danh sách đơn hàng gần đây của bạn:";
                                }
                            } else {
                                finalReply = "Bạn vui lòng đăng nhập tài khoản để mình có thể kiểm tra danh sách đơn hàng nhé.";
                                redirectUrl = "/login";
                            }
                            break;
                            
                        case "cancelOrder":
                            if (isLoggedIn) {
                                if (toolArgs != null && toolArgs.get("orderId") != null) {
                                    try {
                                        Long orderId = Long.valueOf(toolArgs.get("orderId").toString().replaceAll("[^0-9]", ""));
                                        OrderResponse cancelled = orderService.cancelOrder(user, orderId);
                                        finalReply = "Đã hủy thành công đơn hàng #" + orderId + ". Trạng thái hiện tại: " + cancelled.getStatus();
                                        orders = List.of(cancelled);
                                    } catch (com.shop.exception.ResourceNotFoundException e) {
                                        finalReply = "Không tìm thấy đơn hàng tương ứng để hủy hoặc đơn hàng không phải của bạn.";
                                    } catch (com.shop.exception.BadRequestException e) {
                                        finalReply = "Không thể hủy đơn hàng này. Chi tiết: " + e.getMessage();
                                    }
                                } else {
                                    finalReply = "Vui lòng cung cấp mã đơn hàng cần hủy.";
                                }
                            } else {
                                finalReply = "Bạn vui lòng đăng nhập để thực hiện hủy đơn hàng.";
                                redirectUrl = "/login";
                            }
                            break;
                            
                        case "getActiveVouchers":
                            vouchers = voucherService.getAllActiveVouchers();
                            if (vouchers.isEmpty()) {
                                finalReply = "Hiện tại hệ thống chưa có mã giảm giá nào đang hoạt động. Bạn hãy quay lại sau nhé.";
                            }
                            break;
                            
                        default:
                            break;
                    }
                } catch (Exception toolException) {
                    toolException.printStackTrace();
                    finalReply = "Mình chưa thể kiểm tra thông tin lúc này vì hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau nhé.";
                }
            }

            return AIChatResponse.builder()
                    .message(finalReply) // Backward compatibility
                    .reply(finalReply)
                    .intent(intent)
                    .products(products)
                    .orders(orders)
                    .vouchers(vouchers)
                    .redirectUrl(redirectUrl)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return AIChatResponse.builder()
                    .message("Hệ thống trợ lý AI đang bận, bạn vui lòng thử lại sau ít phút nhé.")
                    .reply("Hệ thống trợ lý AI đang bận, bạn vui lòng thử lại sau ít phút nhé.")
                    .intent("UNKNOWN")
                    .products(List.of())
                    .orders(List.of())
                    .vouchers(List.of())
                    .build();
        }
    }
}

