-- V8__add_user_lock_fields.sql
-- Thêm cột khóa tài khoản và lý do vào bảng người dùng (users)
ALTER TABLE users ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN status_reason VARCHAR(500) NULL;
