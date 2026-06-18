package com.shop.controller;

import com.shop.dto.AuthResponse;
import com.shop.dto.LoginRequest;
import com.shop.dto.RegisterRequest;
import com.shop.dto.VerifyRegisterRequest;
import com.shop.dto.UserResponse;
import com.shop.dto.ChangePasswordRequest;
import com.shop.dto.ChangePasswordConfirmRequest;
import com.shop.dto.ForgotPasswordRequest;
import com.shop.dto.ForgotPasswordConfirmRequest;
import com.shop.entity.User;
import com.shop.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Controller", description = "Các API xác thực tài khoản (Register / Login)")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản người dùng mới")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/verify-register")
    @Operation(summary = "Xác nhận mã OTP để kích hoạt tài khoản")
    public ResponseEntity<AuthResponse> verifyRegister(@Valid @RequestBody VerifyRegisterRequest request) {
        AuthResponse response = authService.verifyRegister(request.getEmail(), request.getOtpCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập tài khoản và lấy JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isLocked(user.isLocked())
                .statusReason(user.getStatusReason())
                .createdAt(user.getCreatedAt())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password/request")
    @Operation(summary = "Yêu cầu đổi mật khẩu (sinh mã OTP gửi qua email)")
    public ResponseEntity<?> requestChangePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng chưa đăng nhập!");
        }
        authService.requestChangePassword(user, request);
        return ResponseEntity.ok("Mã xác thực OTP đã được gửi về email của bạn.");
    }

    @PostMapping("/change-password/confirm")
    @Operation(summary = "Xác nhận đổi mật khẩu bằng mã OTP")
    public ResponseEntity<?> confirmChangePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordConfirmRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng chưa đăng nhập!");
        }
        authService.confirmChangePassword(user, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PostMapping("/forgot-password/request")
    @Operation(summary = "Yêu cầu khôi phục mật khẩu (sinh mã OTP gửi qua email)")
    public ResponseEntity<?> requestForgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestForgotPassword(request);
        return ResponseEntity.ok("Mã xác thực OTP khôi phục mật khẩu đã được gửi về email của bạn.");
    }

    @PostMapping("/forgot-password/confirm")
    @Operation(summary = "Xác nhận đặt lại mật khẩu mới bằng mã OTP")
    public ResponseEntity<?> confirmForgotPassword(@Valid @RequestBody ForgotPasswordConfirmRequest request) {
        authService.confirmForgotPassword(request);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
    }
}
