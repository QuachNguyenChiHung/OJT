package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

public class OrderDTO {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        @NotEmpty(message = "Order items cannot be empty")
        private List<OrderItemRequest> items;
        private Integer additionalFee;
        private String shippingAddress;
        private String phone;
        private String paymentMethod;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product details ID is required")
        private UUID productDetailsId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private UUID id;
        private String orderStatus;
        private BigDecimal totalAmount;
        private BigDecimal additionalFee;
        private String shippingAddress;
        private String note;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<OrderItemResponse> items;
        private String customerName;
        private String customerEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private UUID productDetailsId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private UUID id;
        private UUID userId;
        private String status;
        private Instant dateCreated;
        private BigDecimal total;
        private BigDecimal additionalFee;
        private int itemCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusUpdate {
        @NotNull(message = "Trạng thái đơn hàng không được để trống")
        @Pattern(regexp = "^(PENDING|PROCESSING|SHIPPING|DELIVERED|CANCELLED)$",
                message = "Trạng thái đơn hàng không hợp lệ")
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDateRangeRequest {
        @NotNull(message = "Trạng thái không được để trống")
        @Pattern(regexp = "^(PENDING|PROCESSING|SHIPPING|DELIVERED|CANCELLED)$",
                message = "Trạng thái không hợp lệ")
        private String status;

        @NotNull(message = "Ngày bắt đầu không được để trống")
        @PastOrPresent(message = "Ngày bắt đầu không được ở tương lai")
        private Instant startDate;

        @NotNull(message = "Ngày kết thúc không được để trống")
        @PastOrPresent(message = "Ngày kết thúc không được ở tương lai")
        private Instant endDate;
    }

    // DTO for COD Order Creation
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @NotNull(message = "Shipping address is required")
        private String shippingAddress;

        @NotNull(message = "Phone is required")
        @Pattern(regexp = "^[0-9]{10,13}$", message = "Phone number must be 10-13 digits")
        private String phone;

        @NotEmpty(message = "Order items cannot be empty")
        private List<OrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponseDTO {
        private UUID orderId;
        private String status;
        private BigDecimal totalPrice;
        private String paymentMethod;
        private String message;
    }
}

