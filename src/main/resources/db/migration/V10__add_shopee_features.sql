-- V10__add_shopee_features.sql
-- Thêm các bảng và trường phục vụ tính năng Shopee (Wishlist, Review, Voucher, Notification)

-- 1. Bảng Voucher
CREATE TABLE voucher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_amount DECIMAL(15, 2) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    min_order_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    max_discount_value DECIMAL(15, 2) NOT NULL DEFAULT 99999999.99,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng Wishlist (Sản phẩm yêu thích)
CREATE TABLE wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE,
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- 3. Bảng Review (Đánh giá & Bình luận sản phẩm)
CREATE TABLE review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE
);

-- 4. Bảng Notification (Thông báo)
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50) NOT NULL, -- ORDER_SUCCESS, ORDER_CONFIRMED, ORDER_SHIPPING, NEW_VOUCHER, SYSTEM
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Cập nhật bảng product để bổ sung biến thể, giá khuyến mãi và Flash Sale
ALTER TABLE product ADD COLUMN discount_price DECIMAL(15, 2) NULL DEFAULT NULL;
ALTER TABLE product ADD COLUMN colors VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE product ADD COLUMN sizes VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE product ADD COLUMN sold_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE product ADD COLUMN is_flash_sale BOOLEAN NOT NULL DEFAULT FALSE;

-- 6. Cập nhật bảng orders để lưu trữ voucher và số tiền giảm giá
ALTER TABLE orders ADD COLUMN voucher_code VARCHAR(50) NULL DEFAULT NULL;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- 7. Thêm dữ liệu mẫu ban đầu cho Voucher
INSERT INTO voucher (code, discount_amount, discount_type, min_order_value, max_discount_value, start_date, end_date, is_active)
VALUES 
('FREESHIP', 30000.00, 'FIXED', 100000.00, 30000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('SHOPEE10K', 10000.00, 'FIXED', 50000.00, 10000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('GIAM20K', 20000.00, 'FIXED', 150000.00, 20000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('SHOPEE10PCT', 10.00, 'PERCENTAGE', 200000.00, 50000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);
