-- V9__fix_integrity_and_soft_deletes.sql
-- Thêm trường phục vụ xóa mềm (Soft Delete) cho bảng product và category
ALTER TABLE product ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE product ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE category ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE category ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Sửa ràng buộc khóa ngoại để ngăn chặn xóa cứng sản phẩm khi đã có lịch sử đặt hàng
ALTER TABLE order_item DROP FOREIGN KEY fk_order_item_product;
ALTER TABLE order_item ADD CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE RESTRICT;
