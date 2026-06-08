package com.shop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "Receiver ID không được để trống")
    private Long receiverId;

    @NotNull(message = "Order ID không được để trống")
    private Long orderId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;
}
