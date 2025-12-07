package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ProductDTO {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequest {
        @NotBlank(message = "Tên sản phẩm không được để trống")
        private String name;

        @NotBlank(message = "Mô tả sản phẩm không được để trống")
        private String description;

        @NotNull(message = "Giá sản phẩm không được để trống")
        private BigDecimal price;

        @NotNull(message = "ID danh mục không được để trống")
        private UUID categoryId;

        @NotNull(message = "ID thương hiệu không được để trống")
        private UUID brandId;

        @NotNull(message = "Trạng thái sản phẩm không được để trống")
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private UUID id;
        private String name;
        private String description;
        private BigDecimal price;
        private String categoryName;
        private String brandName;
        private Boolean isActive;
        private Boolean isAvailable;
        private Double averageRating;
        private Integer ratingsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummary {
        private UUID id;
        private String name;
        private BigDecimal price;
        private Boolean isAvailable;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSearchResponse {
        private UUID id;
        private String name;
        private BigDecimal price;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDetailResponse {
        private UUID id;
        private String name;
        private BigDecimal price;
        private String description;
        private List<ProductDetailVariant> productDetails;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDetailVariant {
        private UUID pdId;
        private String colorName;
        private String colorCode;
        private String size;
        private Integer amount;
        private Boolean inStock;
        private List<String> images; // Exactly 5 images
    }
}
