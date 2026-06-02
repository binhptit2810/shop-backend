package com.shop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm không được vượt quá 150 ký tự")
    private String name;

    @Size(max = 1000, message = "Mô tả sản phẩm không được vượt quá 1000 ký tự")
    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.00", message = "Giá sản phẩm phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer quantity;

    @Size(max = 255, message = "Đường dẫn ảnh không được vượt quá 255 ký tự")
    private String imageUrl;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    private BigDecimal discountPrice;
    private String colors;
    private String sizes;
    private boolean isFlashSale;
}
