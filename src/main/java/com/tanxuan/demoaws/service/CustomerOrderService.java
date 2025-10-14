package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.constant.OrderStatus;
import com.tanxuan.demoaws.exception.OrderException;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.model.OrderDetails;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.CustomerOrderRepository;
import com.tanxuan.demoaws.repository.OrderDetailsRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomerOrderService {
    private final CustomerOrderRepository orderRepository;
    private final OrderDetailsRepository orderDetailsRepository;
    private final AppUserRepository appUserRepository;
    private final ProductRepository productRepository;

    public List<CustomerOrder> findAll() {
        return orderRepository.findAll();
    }

    public CustomerOrder findById(Long id) {
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
        order.setDateCreated(new Date());

        // Save order first to get ID
        try {
            order = orderRepository.save(order);
        } catch (Exception e) {
            throw new OrderException("Failed to create order", e);
        }

        float totalOrderPrice = 0;

        // Process each order item
        for (OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new OrderException("Product not found with id: " + item.getProductId()));

            // Validate quantity
            if (item.getQuantity() <= 0) {
                throw new OrderException("Quantity must be greater than 0 for product: " + product.getName());
            }

            // Check stock
            if (product.getAmount() < item.getQuantity()) {
                throw new OrderException(String.format(
                    "Not enough stock for product '%s'. Requested: %d, Available: %d",
                    product.getName(), item.getQuantity(), product.getAmount()
                ));
            }

            // Calculate item total price
            float itemPrice = product.getPrice() * item.getQuantity();
            totalOrderPrice += itemPrice;

            // Create order detail
            OrderDetails detail = new OrderDetails();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(product.getPrice());  // Fixed: Store unit price, not total

            try {
                // Save order detail
                orderDetailsRepository.save(detail);
                order.addOrderDetail(detail);

                // Update product stock
                product.setAmount(product.getAmount() - item.getQuantity());
                productRepository.save(product);
            } catch (Exception e) {
                throw new OrderException("Failed to process order item for product: " + product.getName(), e);
            }
        }

        return orderRepository.save(order);
    }

    public CustomerOrder updateStatus(Long id, String status) {
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

    public List<CustomerOrder> findByUser(Long userId) {
        return orderRepository.findByUser_Id(userId);
    }

    public List<CustomerOrder> findByProduct(Long productId) {
        return orderRepository.findByProductId(productId);
    }

    public List<CustomerOrder> findByUserAndStatus(Long userId, String status) {
        return orderRepository.findByUser_IdAndStatus(userId, status);
    }

    public List<CustomerOrder> findOrdersByDateAndStatus(String status, Date startDate, Date endDate) {
        return orderRepository.findByStatusAndDateCreatedBetween(status, startDate, endDate);
    }

    // Add new helper methods
    public float calculateOrderTotal(Long orderId) {
        CustomerOrder order = findById(orderId);
        return order.getOrderDetails().stream()
                .map(detail -> detail.getPrice() * detail.getQuantity())
                .reduce(0f, Float::sum);
    }

    public void cancelOrder(Long orderId) {
        CustomerOrder order = findById(orderId);
        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new OrderException("Can only cancel PENDING orders");
        }

        // Restore product stock
        for (OrderDetails detail : order.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setAmount(product.getAmount() + detail.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "User ID is required")
        private Long userId;

        @NotEmpty(message = "Order items cannot be empty")
        private List<OrderItemRequest> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
