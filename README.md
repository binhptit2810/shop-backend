# E-Commerce Web Shop - Backend

Dự án website bán hàng thương mại điện tử được xây dựng bằng Java Spring Boot 3 và MySQL, thiết kế theo mô hình **Clean Architecture** (Kiến trúc sạch).

Dự án hiện đã hoàn thành:
1. **Giai đoạn 1**: Quản lý Danh mục/Sản phẩm (CRUD Category & Product).
2. **Giai đoạn 2**: Xác thực tài khoản & Phân quyền (Authentication & Authorization với Spring Security, JWT, và Role-Based Access Control).
3. **Giai đoạn 3**: Giỏ hàng & Sản phẩm trong giỏ (Cart & Cart Items).

---

## 🛠️ Công nghệ sử dụng
* **Java 17** (LTS)
* **Spring Boot 3.3.0**
* **Gradle** (Build Tool)
* **Spring Data JPA** (Hibernate)
* **MySQL** (Database)
* **Flyway** (Database Migration)
* **Spring Security** (Bảo mật & Phân quyền)
* **JJWT (Java JWT)** (Phát hành & Xác thực JSON Web Token)
* **Lombok** (Giảm thiểu boilerplate code)
* **Spring Validation** (Kiểm tra dữ liệu đầu vào)
* **Swagger/OpenAPI 3.0** (Tài liệu hóa API)

---

## 📁 Cấu trúc thư mục dự án
Hệ thống tuân thủ cấu trúc thư mục quy định để tách biệt các mối quan tâm (separation of concerns):

```text
src/main/java/com/shop/
├── ShopApplication.java      # Main entry point của ứng dụng
├── config/                   # Cấu hình hệ thống (Swagger, Security...)
│   ├── SwaggerConfig.java
│   └── SecurityConfig.java
├── controller/               # Lớp tiếp nhận request & phản hồi API (REST Controllers)
│   ├── HomeController.java
│   ├── CategoryController.java
│   ├── ProductController.java
│   ├── AuthController.java
│   └── CartController.java
├── service/                  # Lớp chứa nghiệp vụ logic (Business Logic Services)
│   ├── CategoryService.java
│   ├── ProductService.java
│   ├── AuthService.java
│   ├── CartService.java
│   └── impl/
│       ├── CategoryServiceImpl.java
│       ├── ProductServiceImpl.java
│       ├── AuthServiceImpl.java
│       └── CartServiceImpl.java
├── repository/               # Lớp truy vấn cơ sở dữ liệu (Spring Data JPA)
│   ├── CategoryRepository.java
│   ├── ProductRepository.java
│   ├── UserRepository.java
│   ├── CartRepository.java
│   └── CartItemRepository.java
├── entity/                   # Lớp thực thể JPA ánh xạ tới bảng MySQL (Entities)
│   ├── Category.java
│   ├── Product.java
│   ├── User.java
│   ├── Role.java
│   ├── Cart.java
│   └── CartItem.java
├── dto/                      # Lớp chứa dữ liệu truyền tải qua API (Requests & Responses)
│   ├── CategoryRequest.java
│   ├── CategoryResponse.java
│   ├── ProductRequest.java
│   ├── ProductResponse.java
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── CartItemRequest.java
│   ├── CartItemResponse.java
│   └── CartResponse.java
├── mapper/                   # Lớp chuyển đổi qua lại giữa Entity và DTO (Manual Mapping)
│   ├── CategoryMapper.java
│   ├── ProductMapper.java
│   └── CartMapper.java
├── exception/                # Bộ quản lý lỗi và ngoại lệ toàn cục
│   ├── BadRequestException.java
│   ├── ResourceNotFoundException.java
│   ├── ErrorResponse.java
│   └── GlobalExceptionHandler.java
└── security/                 # Thành phần lọc và xác thực JWT
    ├── CustomUserDetailsService.java
    ├── JwtAuthenticationEntryPoint.java
    ├── JwtAuthenticationFilter.java
    └── JwtService.java
```

---

## ⚙️ Cấu hình Môi trường
Dự án sử dụng tệp `.env` để bảo mật thông tin kết nối và cấu hình linh hoạt.

### Ví dụ tệp cấu hình `.env` cho Local:
```env
# Cổng chạy ứng dụng
SERVER_PORT=8080

# Cấu hình Cơ sở dữ liệu MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Cấu hình JWT
JWT_SECRET=9a6563c6e392d04a60032e67df146cf2418e38d79382103fbd82cd411794b823aa
JWT_EXPIRATION=86400000
```

---

## 💾 Migration Cơ sở dữ liệu (Flyway)
Toàn bộ thay đổi cơ sở dữ liệu được quản lý tập trung và tự động thông qua các tập tin SQL Migration tại thư mục `src/main/resources/db/migration/`:
* `V1__initial_schema.sql`: Kiểm tra kết nối và tạo bảng log kiểm thử hệ thống.
* `V2__create_category_table.sql`: Tạo cấu trúc bảng Danh mục (`category`).
* `V3__create_product_table.sql`: Tạo cấu trúc bảng Sản phẩm (`product`) có khóa ngoại liên kết tới bảng danh mục.
* `V4__create_user_table.sql`: Tạo cấu trúc bảng Người dùng (`users`) quản lý tài khoản bảo mật.
* `V5__create_cart_and_cart_item_tables.sql`: Tạo cấu trúc bảng Giỏ hàng (`cart`) và Chi tiết giỏ hàng (`cart_item`).

---

## 🚀 Hướng dẫn khởi chạy cục bộ

1. **Khởi động MySQL** trên máy tính của bạn.
2. **Tạo Database**:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```
3. **Cập nhật tệp `.env`**: Thay đổi `DB_PASSWORD` trùng khớp với mật khẩu cơ sở dữ liệu của bạn.
4. **Chạy ứng dụng**:
   ```powershell
   # Thiết lập JAVA_HOME tới JDK 17+ và khởi chạy ứng dụng
   $env:JAVA_HOME="C:\Users\Dell\.jdks\ms-17.0.18"; .\gradlew bootRun
   ```

---

## 📖 Tài liệu hóa và Kiểm thử API
Sau khi ứng dụng khởi chạy thành công:
* **API Health Check**: Truy cập [http://localhost:8080/](http://localhost:8080/)
* **Tài liệu API Swagger UI**: Truy cập [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) để thực hiện kiểm thử trực quan tất cả các API.
  * *Lưu ý*: Với các API được bảo mật (như tạo sản phẩm, giỏ hàng,...), bạn cần đăng nhập tài khoản qua API Auth, copy chuỗi `accessToken`, nhấn nút **Authorize** ở góc trên bên phải Swagger UI, nhập token vào dưới dạng `Bearer <token>` để xác thực thành công.
