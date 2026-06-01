package com.shop.service;

import com.shop.dto.AuthResponse;
import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;

public interface AuthService {

    /**
     * Đăng ký tài khoản người dùng mới (mặc định Role là USER)
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Xác thực thông tin người dùng và phát hành mã JWT
     */
    AuthResponse login(LoginRequest request);
}
