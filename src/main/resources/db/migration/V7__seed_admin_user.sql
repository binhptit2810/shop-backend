-- V7__seed_admin_user.sql
-- Seed tài khoản Admin mặc định để phục vụ kiểm thử
-- Mật khẩu đã được mã hóa bằng BCrypt là 'admin123'

INSERT INTO users (username, password, email, role)
VALUES ('admin', '$2a$10$pU2B06Vf338C4nO6/XhFouXjK3a.aH0iWjF7249lC51Tee.mR26/K', 'admin@shop.com', 'ADMIN')
ON DUPLICATE KEY UPDATE id=id;
