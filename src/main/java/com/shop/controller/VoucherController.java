package com.shop.controller;

import com.shop.dto.VoucherResponse;
import com.shop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getAllActiveVouchers());
    }

    @GetMapping("/{code}")
    public ResponseEntity<VoucherResponse> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }

    @PostMapping("/apply")
    public ResponseEntity<BigDecimal> applyVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderValue) {
        return ResponseEntity.ok(voucherService.calculateDiscount(code, orderValue));
    }
}
