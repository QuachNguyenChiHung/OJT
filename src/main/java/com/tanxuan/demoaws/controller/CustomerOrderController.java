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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CustomerOrderController {
    private final CustomerOrderService orderService;
    private final OrderDetailsRepository orderDetailsRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll().stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO.OrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(toOrderResponse(orderService.findById(id)));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<List<OrderDTO.OrderItemResponse>> getOrderDetails(@PathVariable UUID id) {
        orderService.findById(id); // Verify order exists
        return ResponseEntity.ok(orderDetailsRepository.findByOrder_oId(id).stream()
            .map(this::toOrderDetailResponse)
            .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<OrderDTO.OrderResponse> createOrder(@Valid @RequestBody OrderDTO.OrderRequest request) {
        // Get current user from SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();

        // Create CreateOrderRequest from OrderDTO.OrderRequest
        CustomerOrderService.CreateOrderRequest serviceRequest = new CustomerOrderService.CreateOrderRequest();
        AppUser user = appUserRepository.findByEmail(userEmail)
            .orElseThrow(() -> new OrderException("User not found with email: " + userEmail));
        serviceRequest.setUserId(user.getUserId());
        serviceRequest.setItems(request.getItems().stream()
            .map(item -> {
                CustomerOrderService.OrderItemRequest orderItem = new CustomerOrderService.OrderItemRequest();
                orderItem.setProductDetailsId(item.getProductDetailsId());
                orderItem.setQuantity(item.getQuantity());
                return orderItem;
            })
            .collect(Collectors.toList()));

        CustomerOrder created = orderService.create(serviceRequest);
        return ResponseEntity
            .created(URI.create("/api/orders/" + created.getOId()))
            .body(toOrderResponse(created));
    }

    /**
     * Create COD Order Endpoint
     * POST /api/orders/create-cod
     */
    @PostMapping("/create-cod")
    public ResponseEntity<OrderDTO.OrderResponseDTO> createOrderCOD(@Valid @RequestBody OrderDTO.CreateOrderRequest request) {
        OrderDTO.OrderResponseDTO response = orderService.createOrderCOD(request);
        return ResponseEntity
            .created(URI.create("/api/orders/" + response.getOrderId()))
            .body(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO.OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OrderDTO.OrderStatusUpdate request) {
        return ResponseEntity.ok(toOrderResponse(orderService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.findByUser(userId).stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByUserAndStatus(
            @PathVariable UUID userId,
            @PathVariable String status) {
        return ResponseEntity.ok(orderService.findByUserAndStatus(userId, status).stream()
            .map(this::toOrderSummary)
            .collect(Collectors.toList()));
    }

    @PostMapping("/status/date-range")
    public ResponseEntity<List<OrderDTO.OrderSummary>> getOrdersByDateRangeAndStatus(
            @Valid @RequestBody OrderDTO.OrderDateRangeRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
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
            order.getOId(),
            order.getStatus(),
            order.getTotalPrice(),
            "",  // CustomerOrder doesn't have shippingAddress
            "",  // CustomerOrder doesn't have note
            LocalDateTime.ofInstant(order.getDateCreated(), ZoneId.systemDefault()),
            LocalDateTime.ofInstant(order.getDateCreated(), ZoneId.systemDefault()),
            items,
            order.getUser().getUName(),
            order.getUser().getEmail()
        );
    }

    private OrderDTO.OrderSummary toOrderSummary(CustomerOrder order) {
        return new OrderDTO.OrderSummary(
            order.getOId(),
            order.getUser().getUserId(),
            order.getStatus(),
            order.getDateCreated(),
            order.getTotalPrice(),
            order.getOrderDetails().size()
        );
    }

    private OrderDTO.OrderItemResponse toOrderDetailResponse(OrderDetails detail) {
        BigDecimal unitPrice = detail.getPrice();
        BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());
        return new OrderDTO.OrderItemResponse(
            detail.getProductDetails().getPdId(),
            detail.getProductDetails().getProduct().getPName(),
            detail.getQuantity(),
            unitPrice,
            unitPrice.multiply(quantity)
        );
    }
}

