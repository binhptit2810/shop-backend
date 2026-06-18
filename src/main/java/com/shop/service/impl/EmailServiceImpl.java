package com.shop.service.impl;

import com.shop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        String subject = "Mã xác thực OTP cho tài khoản BMart";
        String content = "Xin chào,\n\n"
                + "Bạn vừa yêu cầu thực hiện hành động: " + purpose + ".\n"
                + "Mã xác thực OTP của bạn là: " + otpCode + "\n"
                + "Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nBMart Support Team";

        log.info("========== OTP EMAIL SENT ==========");
        log.info("To: {}", toEmail);
        log.info("Purpose: {}", purpose);
        log.info("OTP Code: {}", otpCode);
        log.info("====================================");

        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Email NOT sent via SMTP. OTP code logged above.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP: {}. OTP code logged above.", toEmail, e.getMessage());
        }
    }
}
