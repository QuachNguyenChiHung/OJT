package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "OrderDetails")
public class OrderDetails {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "od_id", columnDefinition = "uniqueidentifier")
    private UUID odId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "o_id", nullable = false)
    private CustomerOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pd_id", nullable = false)
    private ProductDetails productDetails;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Positive(message = "Price must be positive")
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    // Getters and Setters
    public UUID getOdId() { return odId; }
    public void setOdId(UUID odId) { this.odId = odId; }

    public CustomerOrder getOrder() { return order; }
    public void setOrder(CustomerOrder order) { this.order = order; }

    public ProductDetails getProductDetails() { return productDetails; }
    public void setProductDetails(ProductDetails productDetails) { this.productDetails = productDetails; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
