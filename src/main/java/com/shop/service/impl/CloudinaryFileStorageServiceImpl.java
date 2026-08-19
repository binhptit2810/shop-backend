package com.shop.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.shop.exception.BadRequestException;
import com.shop.service.FileStorageResult;
import com.shop.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.type", havingValue = "cloudinary")
public class CloudinaryFileStorageServiceImpl implements FileStorageService {

    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    @Override
    public FileStorageResult storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tin tải lên trống hoặc không hợp lệ");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Chỉ cho phép tải lên các định dạng ảnh phổ biến (JPEG, PNG, GIF, WEBP)");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "ecommerce/products"
            ));
            
            String secureUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();
            
            return new FileStorageResult(secureUrl, publicId);
        } catch (IOException e) {
            throw new BadRequestException("Không thể tải lên tệp tin lên Cloudinary. Vui lòng thử lại! Chi tiết: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        // Implementation logic expects publicId instead of URL to delete from Cloudinary
        // It's recommended to call deleteByPublicId directly if possible
        if (fileUrl != null && fileUrl.contains("res.cloudinary.com")) {
            // Try to extract publicId from URL if publicId wasn't stored (for legacy migration support)
            // e.g. https://res.cloudinary.com/demo/image/upload/v123456789/ecommerce/products/sample.jpg
            try {
                String[] parts = fileUrl.split("/");
                String filename = parts[parts.length - 1]; // sample.jpg
                String folder = parts[parts.length - 2]; // products
                String rootFolder = parts[parts.length - 3]; // ecommerce
                String publicId = rootFolder + "/" + folder + "/" + filename.split("\\.")[0];
                deleteByPublicId(publicId);
            } catch (Exception e) {
                System.err.println("Không thể extract public_id từ URL: " + fileUrl);
            }
        }
    }
    
    public void deleteByPublicId(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            System.err.println("Không thể xóa ảnh trên Cloudinary với publicId: " + publicId + ". Chi tiết: " + e.getMessage());
        }
    }
}
