-- V11__change_image_url_to_text.sql
-- Thay đổi kiểu dữ liệu của image_url trong bảng product và review sang LONGTEXT để lưu trữ chuỗi Base64 lâu dài

ALTER TABLE product MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE review MODIFY COLUMN image_url LONGTEXT;
