package com.shop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
    @Size(max = 255, message = "Địa chỉ nhận hàng không vượt quá 255 ký tự")
    private String shippingAddress;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @Size(max = 20, message = "Số điện thoại không vượt quá 20 ký tự")
    private String phoneNumber;

    private String voucherCode;
}
