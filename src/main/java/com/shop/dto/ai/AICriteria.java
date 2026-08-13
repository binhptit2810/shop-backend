package com.shop.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AICriteria {
    private String categoryName;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String keywords;
}
