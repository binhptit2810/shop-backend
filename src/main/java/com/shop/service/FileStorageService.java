package com.shop.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Lưu trữ tệp tin được tải lên và trả về thông tin file đã lưu
     *
     * @param file Tệp tin cần tải lên
     * @return Kết quả lưu trữ chứa url và publicId (nếu có)
     */
    FileStorageResult storeFile(MultipartFile file);

    /**
     * Xóa tệp tin trên hệ thống lưu trữ dựa vào đường dẫn tương đối đã trả về khi store
     *
     * @param fileUrl Đường dẫn lưu trữ (ví dụ: /uploads/uuid_file.png)
     */
    void deleteFile(String fileUrl);
}
