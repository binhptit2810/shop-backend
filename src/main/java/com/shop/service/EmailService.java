package com.shop.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode, String purpose);
}
