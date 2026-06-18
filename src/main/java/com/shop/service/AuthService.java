package com.shop.service;

import com.shop.dto.AuthResponse;
import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;
import com.shop.dto.ChangePasswordRequest;
import com.shop.dto.ChangePasswordConfirmRequest;
import com.shop.dto.ForgotPasswordRequest;
import com.shop.dto.ForgotPasswordConfirmRequest;
import com.shop.entity.User;

public interface AuthService {

    /**
     * Đăng ký tài khoản người dùng mới (mặc định Role là USER)
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Xác thực thông tin người dùng và phát hành mã JWT
     */
    AuthResponse login(LoginRequest request);

    /**
     * Yêu cầu đổi mật khẩu (sinh OTP gửi qua email)
     */
    void requestChangePassword(User currentUser, ChangePasswordRequest request);

    /**
     * Xác nhận đổi mật khẩu với OTP
     */
    void confirmChangePassword(User currentUser, ChangePasswordConfirmRequest request);

    /**
     * Yêu cầu quên mật khẩu (sinh OTP gửi qua email)
     */
    void requestForgotPassword(ForgotPasswordRequest request);

    /**
     * Xác nhận đặt lại mật khẩu với OTP khi quên mật khẩu
     */
    void confirmForgotPassword(ForgotPasswordConfirmRequest request);
}
