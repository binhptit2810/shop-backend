package com.shop.service.impl;

import com.shop.dto.VoucherResponse;
import com.shop.entity.Voucher;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.repository.VoucherRepository;
import com.shop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllActiveVouchers() {
        return voucherRepository.findByIsActiveTrue().stream()
                .filter(v -> v.getEndDate().isAfter(LocalDateTime.now()) && v.getStartDate().isBefore(LocalDateTime.now()))
                .map(v -> VoucherResponse.builder()
                        .id(v.getId())
                        .code(v.getCode())
                        .discountAmount(v.getDiscountAmount())
                        .discountType(v.getDiscountType())
                        .minOrderValue(v.getMinOrderValue())
                        .maxDiscountValue(v.getMaxDiscountValue())
                        .startDate(v.getStartDate())
                        .endDate(v.getEndDate())
                        .isActive(v.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherByCode(String code) {
        Voucher v = voucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại!"));
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .discountAmount(v.getDiscountAmount())
                .discountType(v.getDiscountType())
                .minOrderValue(v.getMinOrderValue())
                .maxDiscountValue(v.getMaxDiscountValue())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .isActive(v.isActive())
                .build();
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal orderValue) {
        Voucher v = voucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại!"));

        if (!v.isActive() || v.getStartDate().isAfter(LocalDateTime.now()) || v.getEndDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn hoặc không còn hiệu lực!");
        }

        if (orderValue.compareTo(v.getMinOrderValue()) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + v.getMinOrderValue() + "đ để áp dụng mã này!");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (v.getDiscountType().equals("FIXED")) {
            discount = v.getDiscountAmount();
        } else if (v.getDiscountType().equals("PERCENTAGE")) {
            discount = orderValue.multiply(v.getDiscountAmount()).divide(BigDecimal.valueOf(100));
            if (discount.compareTo(v.getMaxDiscountValue()) > 0) {
                discount = v.getMaxDiscountValue();
            }
        }

        return discount;
    }
}
