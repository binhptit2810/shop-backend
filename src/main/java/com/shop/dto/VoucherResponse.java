package com.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String code;
    private BigDecimal discountAmount;
    private String discountType;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean isActive;
}
