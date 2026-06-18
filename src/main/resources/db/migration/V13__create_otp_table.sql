-- V13__create_otp_table.sql
-- Script tạo bảng lưu trữ mã OTP phục vụ đổi/quên mật khẩu

CREATE TABLE otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'CHANGE_PASSWORD', 'FORGOT_PASSWORD'
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_otp (email, otp_code)
);
