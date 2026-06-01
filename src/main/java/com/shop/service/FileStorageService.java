package com.shop.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Lưu trữ tệp tin được tải lên và trả về đường dẫn tương đối để truy cập qua Web (vd: /uploads/uuid_file.png)
     *
     * @param file Tệp tin cần tải lên
     * @return Đường dẫn tương đối dùng để lưu vào CSDL và làm URL truy cập tĩnh
     */
    String storeFile(MultipartFile file);

    /**
     * Xóa tệp tin trên hệ thống lưu trữ dựa vào đường dẫn tương đối đã trả về khi store
     *
     * @param fileUrl Đường dẫn lưu trữ (ví dụ: /uploads/uuid_file.png)
     */
    void deleteFile(String fileUrl);
}
