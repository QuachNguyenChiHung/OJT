package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.constant.OrderStatus;
import com.tanxuan.demoaws.exception.OrderException;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.model.OrderDetails;
import com.tanxuan.demoaws.model.ProductDetails;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.CustomerOrderRepository;
import com.tanxuan.demoaws.repository.OrderDetailsRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomerOrderService {
    private final CustomerOrderRepository orderRepository;
    private final OrderDetailsRepository orderDetailsRepository;
    private final AppUserRepository appUserRepository;
    private final ProductDetailsRepository productDetailsRepository;

    public List<CustomerOrder> findAll() {
        return orderRepository.findAll();
    }

    public CustomerOrder findById(UUID id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new OrderException("Order not found with id: " + id));
    }

    public CustomerOrder create(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new OrderException("Order must contain at least one item");
        }

        AppUser user = appUserRepository.findById(request.getUserId())
            .orElseThrow(() -> new OrderException("User not found with id: " + request.getUserId()));

        // Create new order
        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setDateCreated(Instant.now());

        // Save order first to get ID
        try {
            order = orderRepository.save(order);
        } catch (Exception e) {
            throw new OrderException("Failed to create order", e);
        }

        // Process each order item
        for (OrderItemRequest item : request.getItems()) {
            ProductDetails productDetails = productDetailsRepository.findById(item.getProductDetailsId())
                .orElseThrow(() -> new OrderException("Product details not found with id: " + item.getProductDetailsId()));

            // Validate quantity
            if (item.getQuantity() <= 0) {
                throw new OrderException("Quantity must be greater than 0 for product: " + productDetails.getProduct().getPName());
            }

            // Check stock
            if (productDetails.getAmount() < item.getQuantity()) {
                throw new OrderException(String.format(
                    "Not enough stock for product '%s'. Requested: %d, Available: %d",
                    productDetails.getProduct().getPName(), item.getQuantity(), productDetails.getAmount()
                ));
            }

            // Calculate item total price
            BigDecimal itemPrice = productDetails.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

            // Create order detail
            OrderDetails detail = new OrderDetails();
            detail.setOrder(order);
            detail.setProductDetails(productDetails);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(productDetails.getProduct().getPrice());  // Store unit price

            try {
                // Save order detail
                orderDetailsRepository.save(detail);
                order.addOrderDetail(detail);

                // Update product stock
                productDetails.setAmount(productDetails.getAmount() - item.getQuantity());
                productDetailsRepository.save(productDetails);
            } catch (Exception e) {
                throw new OrderException("Failed to process order item for product: " + productDetails.getProduct().getPName(), e);
            }
        }

        // Calculate and set total price
        order.calculateTotalPrice();
        return orderRepository.save(order);
    }

    public CustomerOrder updateStatus(UUID id, String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new OrderException("Status cannot be empty");
        }

        CustomerOrder order = findById(id);

        // Validate status transition
        validateStatusTransition(order.getStatus(), status);

        order.setStatus(status);
        return orderRepository.save(order);
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions using OrderStatus constants
        if (currentStatus.equals(OrderStatus.PENDING)) {
            if (!newStatus.equals(OrderStatus.PROCESSING) && !newStatus.equals(OrderStatus.CANCELLED)) {
                throw new OrderException("Invalid status transition from PENDING to " + newStatus);
            }
        } else if (currentStatus.equals(OrderStatus.PROCESSING)) {
            if (!newStatus.equals(OrderStatus.SHIPPING) && !newStatus.equals(OrderStatus.CANCELLED)) {
                throw new OrderException("Invalid status transition from PROCESSING to " + newStatus);
            }
        } else if (currentStatus.equals(OrderStatus.SHIPPING)) {
            if (!newStatus.equals(OrderStatus.DELIVERED)) {
                throw new OrderException("Invalid status transition from SHIPPING to " + newStatus);
            }
        } else if (currentStatus.equals(OrderStatus.DELIVERED) || currentStatus.equals(OrderStatus.CANCELLED)) {
            throw new OrderException("Cannot change status of " + currentStatus + " order");
        }
    }

    public List<CustomerOrder> findByUser(UUID userId) {
        return orderRepository.findByUserUserId(userId);
    }

    public List<CustomerOrder> findByProduct(UUID productId) {
        return orderRepository.findByProductId(productId);
    }

    public List<CustomerOrder> findByUserAndStatus(UUID userId, String status) {
        return orderRepository.findByUserUserIdAndStatus(userId, status);
    }

    public List<CustomerOrder> findOrdersByDateAndStatus(String status, Instant startDate, Instant endDate) {
        return orderRepository.findByStatusAndDateCreatedBetween(status, startDate, endDate);
    }

    // Add new helper methods
    public BigDecimal calculateOrderTotal(UUID orderId) {
        CustomerOrder order = findById(orderId);
        return order.getOrderDetails().stream()
                .map(detail -> detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void cancelOrder(UUID orderId) {
        CustomerOrder order = findById(orderId);
        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new OrderException("Can only cancel PENDING orders");
        }

        // Restore product stock
        for (OrderDetails detail : order.getOrderDetails()) {
            ProductDetails productDetails = detail.getProductDetails();
            productDetails.setAmount(productDetails.getAmount() + detail.getQuantity());
            productDetailsRepository.save(productDetails);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @NotEmpty(message = "Order items cannot be empty")
        private List<OrderItemRequest> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product details ID is required")
        private UUID productDetailsId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
