-- V1__initial_schema.sql
-- Script khởi tạo cơ sở dữ liệu ban đầu cho MySQL.

CREATE TABLE system_init_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    init_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(255) NOT NULL
);

INSERT INTO system_init_log (message) VALUES ('System schema initialized successfully');
