package com.tanxuan.demoaws.model;

import com.tanxuan.demoaws.constant.OrderStatus;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Orders")
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "o_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "date_created")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreated;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetails> orderDetails = new ArrayList<>();

    public CustomerOrder() {
        this.dateCreated = new Date();
        this.status = OrderStatus.PENDING;  // Fixed: Use constant instead of hardcoded string
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getDateCreated() { return dateCreated; }
    public void setDateCreated(Date dateCreated) { this.dateCreated = dateCreated; }

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

    // Calculate total price
    public Float getTotalPrice() {
        return orderDetails.stream()
            .map(detail -> detail.getPrice() * detail.getQuantity())
            .reduce(0f, Float::sum);
    }
}
