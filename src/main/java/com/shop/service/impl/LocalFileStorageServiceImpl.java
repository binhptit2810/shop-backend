package com.shop.service.impl;

import com.shop.exception.BadRequestException;
import com.shop.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final String uploadDir;
    
    // Các định dạng ảnh được phép tải lên
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    public LocalFileStorageServiceImpl(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public String storeFile(MultipartFile file) {
        // 1. Kiểm tra file rỗng
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tin tải lên trống hoặc không hợp lệ");
        }

        // 2. Kiểm định định dạng ảnh qua Content-Type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Chỉ cho phép tải lên các định dạng ảnh phổ biến (JPEG, PNG, GIF, WEBP)");
        }

        try {
            // 3. Tạo thư mục lưu trữ nếu chưa tồn tại
            Path uploadPath = Paths.get(this.uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 4. Sinh tên file độc bản bằng UUID để tránh trùng lặp
            String originalFilename = file.getOriginalFilename();
            String extension = "png"; // Mặc định nếu không lấy được phần mở rộng
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            }
            String fileName = UUID.randomUUID().toString() + "." + extension;

            // 5. Ghi tệp tin xuống đĩa cứng
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 6. Trả về đường dẫn truy cập tương đối qua URL tĩnh
            return "/uploads/" + fileName;

        } catch (IOException ex) {
            throw new BadRequestException("Không thể lưu trữ tệp tin. Vui lòng thử lại! Chi tiết: " + ex.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return;
        }

        // Trích xuất tên file từ URL tương đối dạng /uploads/uuid_filename.ext
        if (fileUrl.startsWith("/uploads/")) {
            String fileName = fileUrl.substring("/uploads/".length());
            try {
                Path filePath = Paths.get(this.uploadDir).toAbsolutePath().normalize().resolve(fileName);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Chỉ log hoặc bỏ qua, không ném ngoại lệ làm ảnh hưởng transaction chính
                System.err.println("Không thể xóa file cũ tại đường dẫn: " + fileUrl + ". Chi tiết: " + e.getMessage());
            }
        }
    }
}
