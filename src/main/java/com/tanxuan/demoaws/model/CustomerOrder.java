package com.tanxuan.demoaws.model;

import com.tanxuan.demoaws.constant.OrderStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Orders")
public class CustomerOrder {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "o_id", columnDefinition = "uniqueidentifier")
    private UUID oId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id", nullable = false)
    private AppUser user;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "date_created")
    private Instant dateCreated;

    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "shipping_address", columnDefinition = "nvarchar(500)")
    private String shippingAddress;

    @Column(name = "phone", length = 20)
    private String phone;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetails> orderDetails = new ArrayList<>();

    public CustomerOrder() {
        this.dateCreated = Instant.now();
        this.status = OrderStatus.PENDING;
        this.totalPrice = BigDecimal.ZERO;
    }

    // Getters and Setters
    public UUID getOId() { return oId; }
    public void setOId(UUID oId) { this.oId = oId; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getDateCreated() { return dateCreated; }
    public void setDateCreated(Instant dateCreated) { this.dateCreated = dateCreated; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public List<OrderDetails> getOrderDetails() { return orderDetails; }
    public void setOrderDetails(List<OrderDetails> orderDetails) {
        this.orderDetails.clear();
        if (orderDetails != null) {
            this.orderDetails.addAll(orderDetails);
            orderDetails.forEach(detail -> detail.setOrder(this));
        }
    }

    // Helper methods
    public void addOrderDetail(OrderDetails detail) {
        orderDetails.add(detail);
        detail.setOrder(this);
    }

    public void removeOrderDetail(OrderDetails detail) {
        orderDetails.remove(detail);
        detail.setOrder(null);
    }

    // Calculate and update total price
    public void calculateTotalPrice() {
        this.totalPrice = orderDetails.stream()
            .map(detail -> detail.getPrice().multiply(new BigDecimal(detail.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
