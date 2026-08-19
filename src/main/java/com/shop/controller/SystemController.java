package com.shop.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.shop.entity.Product;
import com.shop.entity.User;
import com.shop.repository.ProductRepository;
import com.shop.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/system")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "System Admin Controller", description = "System administration tasks")
public class SystemController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/migrate-images")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Migrate local and base64 images to Cloudinary (Admin only)")
    public ResponseEntity<Map<String, Object>> migrateImages() {
        Map<String, Object> response = new HashMap<>();
        int productSuccess = 0;
        int productFailed = 0;
        int userSuccess = 0;
        int userFailed = 0;

        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String url = p.getImageUrl();
            if (url == null || p.getImagePublicId() != null) {
                continue; // Skip if no image or already migrated
            }

            try {
                if (url.startsWith("/uploads/")) {
                    String filename = url.substring("/uploads/".length());
                    Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
                    File file = filePath.toFile();
                    if (file.exists()) {
                        Map uploadResult = cloudinary.uploader().upload(file, ObjectUtils.asMap("folder", "ecommerce/products"));
                        p.setImageUrl(uploadResult.get("secure_url").toString());
                        p.setImagePublicId(uploadResult.get("public_id").toString());
                        productRepository.save(p);
                        productSuccess++;
                    } else {
                        log.warn("Product ID {} file not found at {}", p.getId(), filePath);
                        productFailed++;
                    }
                } else if (url.startsWith("data:image")) {
                    String[] parts = url.split(",");
                    if (parts.length > 1) {
                        String base64Data = parts[1];
                        byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
                        Map uploadResult = cloudinary.uploader().upload(decodedBytes, ObjectUtils.asMap("folder", "ecommerce/products"));
                        p.setImageUrl(uploadResult.get("secure_url").toString());
                        p.setImagePublicId(uploadResult.get("public_id").toString());
                        productRepository.save(p);
                        productSuccess++;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to migrate image for Product ID {}: {}", p.getId(), e.getMessage());
                productFailed++;
            }
        }

        List<User> users = userRepository.findAll();
        for (User u : users) {
            String url = u.getAvatarUrl();
            if (url == null || u.getAvatarPublicId() != null) {
                continue; // Skip if no avatar or already migrated
            }

            try {
                if (url.startsWith("/uploads/")) {
                    String filename = url.substring("/uploads/".length());
                    Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
                    File file = filePath.toFile();
                    if (file.exists()) {
                        Map uploadResult = cloudinary.uploader().upload(file, ObjectUtils.asMap("folder", "ecommerce/avatars"));
                        u.setAvatarUrl(uploadResult.get("secure_url").toString());
                        u.setAvatarPublicId(uploadResult.get("public_id").toString());
                        userRepository.save(u);
                        userSuccess++;
                    } else {
                        log.warn("User ID {} file not found at {}", u.getId(), filePath);
                        userFailed++;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to migrate avatar for User ID {}: {}", u.getId(), e.getMessage());
                userFailed++;
            }
        }

        response.put("message", "Migration complete");
        response.put("productSuccess", productSuccess);
        response.put("productFailed", productFailed);
        response.put("userSuccess", userSuccess);
        response.put("userFailed", userFailed);

        return ResponseEntity.ok(response);
    }
}
