package com.shop.service;

import com.shop.dto.VoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getAllActiveVouchers();
    VoucherResponse getVoucherByCode(String code);
    BigDecimal calculateDiscount(String code, BigDecimal orderValue);
}
