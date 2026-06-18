package com.shop.service.impl;

import com.shop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

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

        String brevoApiKey = System.getenv("BREVO_API_KEY");
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevoApi(toEmail, subject, content, brevoApiKey);
        } else {
            sendViaSmtp(toEmail, subject, content);
        }
    }

    private void sendViaSmtp(String toEmail, String subject, String content) {
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
            log.info("Email sent successfully to {} via SMTP", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP: {}. OTP code logged above.", toEmail, e.getMessage());
        }
    }

    private void sendViaBrevoApi(String toEmail, String subject, String content, String apiKey) {
        String senderEmail = System.getenv("MAIL_USERNAME");
        if (senderEmail == null || senderEmail.isBlank()) {
            senderEmail = "thanhbinhd745@gmail.com";
        }

        try {
            String json = "{"
                    + "\"sender\":{\"name\":\"BMart Support\",\"email\":\"" + senderEmail + "\"},"
                    + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
                    + "\"subject\":\"" + escapeJson(subject) + "\","
                    + "\"textContent\":\"" + escapeJson(content) + "\""
                    + "}";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent successfully to {} via Brevo HTTP API", toEmail);
            } else {
                log.error("Failed to send email via Brevo HTTP API. Status: {}, Response: {}", 
                        response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error sending email via Brevo HTTP API: {}", e.getMessage(), e);
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}
