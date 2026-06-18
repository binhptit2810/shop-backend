-- V14__add_enabled_to_users.sql
-- Thêm cột is_enabled vào bảng người dùng (users) để quản lý kích hoạt email
ALTER TABLE users ADD COLUMN is_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Kích hoạt sẵn tất cả các tài khoản hiện có trong hệ thống (như Admin/Seller hiện tại)
UPDATE users SET is_enabled = TRUE;
