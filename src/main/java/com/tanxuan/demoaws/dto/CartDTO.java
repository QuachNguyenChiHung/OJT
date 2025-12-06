package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class CartDTO {

    // Private constructor to prevent instantiation
    private CartDTO() {
        throw new UnsupportedOperationException("Utility class");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddToCartRequest {
        @NotNull(message = "Product Details ID không được để trống")
        private UUID productDetailsId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải ít nhất là 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCartRequest {
        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải ít nhất là 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private UUID cartId;
        private UUID productId;
        private UUID productDetailsId;
        private String productName;
        private BigDecimal price;
        private String size;
        private String colorName;
        private String colorCode;
        private Integer quantity;
        private String image; // First image from imgList
        private BigDecimal itemTotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartSummaryResponse {
        private java.util.List<CartItemResponse> items;
        private Integer totalItems;
        private BigDecimal totalPrice;
        private BigDecimal estimatedShipping;
        private BigDecimal grandTotal;
    }
}

