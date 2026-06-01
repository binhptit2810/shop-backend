package com.shop.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
@Tag(name = "Home Controller", description = "Các API kiểm tra trạng thái hoạt động của Server.")
public class HomeController {

    @GetMapping
    @Operation(summary = "Kiểm tra sức khỏe của ứng dụng (Health Check)")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Shop Backend is running successfully.");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
