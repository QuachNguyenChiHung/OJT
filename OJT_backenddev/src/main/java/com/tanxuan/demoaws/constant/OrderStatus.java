package com.tanxuan.demoaws.constant;

public class OrderStatus {
    // Đơn hàng mới tạo
    public static final String PENDING = "PENDING";
    // Đơn hàng đang được xử lý
    public static final String PROCESSING = "PROCESSING";
    // Đơn hàng đang giao
    public static final String SHIPPING = "SHIPPING";
    // Đơn hàng đã giao thành công
    public static final String DELIVERED = "DELIVERED";
    // Đơn hàng đã hủy
    public static final String CANCELLED = "CANCELLED";

    private OrderStatus() {} // Prevent instantiation
}
