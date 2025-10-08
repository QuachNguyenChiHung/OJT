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
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

public class OrderDTO {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        @NotEmpty(message = "Order items cannot be empty")
        private List<OrderItemRequest> items;

        private String shippingAddress;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private String orderStatus;
        private BigDecimal totalAmount;
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
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private Long id;
        private Long userId;
        private String status;
        private LocalDateTime dateCreated;
        private BigDecimal total;
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
        private Date startDate;

        @NotNull(message = "Ngày kết thúc không được để trống")
        @PastOrPresent(message = "Ngày kết thúc không được ở tương lai")
        private Date endDate;
    }
}
