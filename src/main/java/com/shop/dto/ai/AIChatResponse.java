package com.shop.dto.ai;

import com.shop.dto.ProductResponse;
import com.shop.dto.OrderResponse;
import com.shop.dto.VoucherResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIChatResponse {
    private String message;
    private String reply;
    private String intent;
    private List<ProductResponse> products;
    private List<OrderResponse> orders;
    private List<VoucherResponse> vouchers;
    private String redirectUrl;
}
