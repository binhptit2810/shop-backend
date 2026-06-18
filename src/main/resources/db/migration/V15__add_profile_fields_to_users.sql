-- V15__add_profile_fields_to_users.sql
-- Thêm các cột thông tin liên hệ và ảnh đại diện vào bảng người dùng (users)
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN address VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL;
