package com.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private java.math.BigDecimal productPrice;
    private java.math.BigDecimal productDiscountPrice;
    private LocalDateTime createdAt;
}
