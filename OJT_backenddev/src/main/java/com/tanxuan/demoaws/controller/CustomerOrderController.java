package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.OrderDTO;
import com.tanxuan.demoaws.exception.OrderException;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.model.OrderDetails;
import com.tanxuan.demoaws.model.Cart;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.OrderDetailsRepository;
import com.tanxuan.demoaws.repository.CartRepository;
import com.tanxuan.demoaws.service.CustomerOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
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
    private final CartRepository cartRepository;

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
        serviceRequest.setAdditionalFee(request.getAdditionalFee());
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
        // Re-fetch persisted order to ensure date/time and any DB-side conversions are present
        CustomerOrder persisted = orderService.findById(created.getOId());
        return ResponseEntity
            .created(URI.create("/api/orders/" + persisted.getOId()))
            .body(toOrderResponse(persisted));
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

    @GetMapping("/user/{userId:[0-9a-fA-F\\-]{36}}/status/{status}")
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

        BigDecimal additionalFee = calculateAdditionalFee(order.getUser().getUserId());

        OrderDTO.OrderResponse resp = new OrderDTO.OrderResponse();
        resp.setId(order.getOId());
        resp.setOrderStatus(order.getStatus());
        resp.setTotalAmount(order.getTotalPrice());
        resp.setAdditionalFee(additionalFee);
        resp.setShippingAddress(order.getShippingAddress() == null ? "" : order.getShippingAddress());
        resp.setNote("");
        resp.setCreatedAt(LocalDateTime.ofInstant(order.getDateCreated(), ZoneId.systemDefault()));
        resp.setUpdatedAt(LocalDateTime.ofInstant(order.getDateCreated(), ZoneId.systemDefault()));
        resp.setItems(items);
        resp.setCustomerName(order.getUser().getUName());
        resp.setCustomerEmail(order.getUser().getEmail());
        return resp;
    }

    private OrderDTO.OrderSummary toOrderSummary(CustomerOrder order) {
        BigDecimal additionalFee = calculateAdditionalFee(order.getUser().getUserId());
        OrderDTO.OrderSummary s = new OrderDTO.OrderSummary();
        s.setId(order.getOId());
        s.setUserId(order.getUser().getUserId());
        s.setStatus(order.getStatus());
        s.setDateCreated(order.getDateCreated());
        s.setTotal(order.getTotalPrice());
        s.setAdditionalFee(additionalFee);
        s.setItemCount(order.getOrderDetails().size());
        return s;
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

    private BigDecimal calculateAdditionalFee(UUID userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        BigDecimal subtotal = carts.stream()
            .map(Cart::getItemTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal fee = subtotal.multiply(new BigDecimal("0.05"));
        return fee.setScale(2, RoundingMode.HALF_UP);
    }
}
