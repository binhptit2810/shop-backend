package com.shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class ShopApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(ShopApplication.class, args);
    }

    /**
     * Tự động đọc file .env ở thư mục gốc của dự án và nạp vào System Properties
     * của Java để Spring Boot có thể giải quyết các biến cấu hình thông qua cú pháp ${VAR}.
     */
    private static void loadEnv() {
        try {
            if (Files.exists(Paths.get(".env"))) {
                List<String> lines = Files.readAllLines(Paths.get(".env"));
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf("=");
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        
                        // Loại bỏ dấu nháy đơn/kép bao quanh giá trị nếu có
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        System.setProperty(key, value);
                    }
                }
                System.out.println("[INFO] Loaded .env environment variables successfully.");
            } else {
                System.out.println("[WARN] .env file not found. Falling back to default system/application configurations.");
            }
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to load .env file: " + e.getMessage());
        }
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner initAdmin(
            com.shop.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByUsername("admin").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(user);
                System.out.println("[SEED] Admin user password initialized and encoded successfully.");
            });
        };
    }
}

