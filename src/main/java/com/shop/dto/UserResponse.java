package com.shop.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String phoneNumber;
    private String address;
    private String avatarUrl;
    
    @JsonProperty("isLocked")
    private boolean isLocked;
    
    private String statusReason;
    private LocalDateTime createdAt;
    private int totalOrders;
    private double totalSpent;
}
