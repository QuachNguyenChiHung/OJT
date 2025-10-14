package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.OrderDTO;
import com.tanxuan.demoaws.exception.OrderException;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.model.OrderDetails;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.OrderDetailsRepository;
import com.tanxuan.demoaws.service.CustomerOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CustomerOrderController {
    private final CustomerOrderService orderService;
    private final OrderDetailsRepository orderDetailsRepository;
    private final AppUserRepository appUserRepository; // Thêm repository

    @GetMapping
    public ResponseEntity<List<OrderDTO.OrderSummary>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll().stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO.OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(toOrderResponse(orderService.findById(id)));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<List<OrderDTO.OrderItemResponse>> getOrderDetails(@PathVariable Long id) {
        orderService.findById(id); // Verify order exists
        return ResponseEntity.ok(orderDetailsRepository.findByOrder_Id(id).stream()
            .map(this::toOrderDetailResponse)
            .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<OrderDTO.OrderResponse> createOrder(@Valid @RequestBody OrderDTO.OrderRequest request) {
        // Lấy thông tin user hiện tại từ SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();

        // Tạo CreateOrderRequest từ OrderDTO.OrderRequest
        CustomerOrderService.CreateOrderRequest serviceRequest = new CustomerOrderService.CreateOrderRequest();
        AppUser user = appUserRepository.findByEmail(userEmail)
            .orElseThrow(() -> new OrderException("User not found with email: " + userEmail));
        serviceRequest.setUserId(user.getId());
        serviceRequest.setItems(request.getItems().stream()
            .map(item -> {
                CustomerOrderService.OrderItemRequest orderItem = new CustomerOrderService.OrderItemRequest();
                orderItem.setProductId(item.getProductId());
                orderItem.setQuantity(item.getQuantity());
                return orderItem;
            })
            .collect(Collectors.toList()));

        CustomerOrder created = orderService.create(serviceRequest);
        return ResponseEntity
            .created(URI.create("/api/orders/" + created.getId()))
            .body(toOrderResponse(created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO.OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderDTO.OrderStatusUpdate request) {
        return ResponseEntity.ok(toOrderResponse(orderService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.findByUser(userId).stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByUserAndStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        return ResponseEntity.ok(orderService.findByUserAndStatus(userId, status).stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @PostMapping("/status/date-range")  // Fixed: Changed from GET to POST for @RequestBody
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByDateRangeAndStatus(
            @Valid @RequestBody OrderDTO.OrderDateRangeRequest request) {
        if (request.getStartDate().after(request.getEndDate())) {
            throw new OrderException("Ngày bắt đầu không được sau ngày kết thúc");
        }
        return ResponseEntity.ok(orderService.findOrdersByDateAndStatus(
            request.getStatus(),
            request.getStartDate(),
            request.getEndDate()
        ).stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    // Helper methods
    private OrderDTO.OrderResponse toOrderResponse(CustomerOrder order) {
        List<OrderDTO.OrderItemResponse> items = order.getOrderDetails().stream()
            .map(this::toOrderDetailResponse)
            .collect(Collectors.toList());

        return new OrderDTO.OrderResponse(
            order.getId(),
            order.getStatus(),
            calculateTotal(order),
            "",  // CustomerOrder không có shippingAddress
            "",  // CustomerOrder không có note
            LocalDateTime.ofInstant(order.getDateCreated().toInstant(), ZoneId.systemDefault()),
            LocalDateTime.ofInstant(order.getDateCreated().toInstant(), ZoneId.systemDefault()),
            items,
            order.getUser().getFullName(),
            order.getUser().getEmail()
        );
    }

    private OrderDTO.OrderSummary toOrderSummary(CustomerOrder order) {
        return new OrderDTO.OrderSummary(
            order.getId(),
            order.getUser().getId(),
            order.getStatus(),
            LocalDateTime.ofInstant(order.getDateCreated().toInstant(), ZoneId.systemDefault()),
            calculateTotal(order),
            order.getOrderDetails().size()
        );
    }

    private OrderDTO.OrderItemResponse toOrderDetailResponse(OrderDetails detail) {
        BigDecimal price = BigDecimal.valueOf(detail.getPrice());
        BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());
        return new OrderDTO.OrderItemResponse(
            detail.getProduct().getId(),
            detail.getProduct().getName(),
            detail.getQuantity(),
            price,
            price.multiply(quantity)
        );
    }

    private BigDecimal calculateTotal(CustomerOrder order) {
        return order.getOrderDetails().stream()
            .map(detail -> BigDecimal.valueOf(detail.getPrice())
                .multiply(BigDecimal.valueOf(detail.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
