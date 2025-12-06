package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "Cart")
public class Cart {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "cart_id", columnDefinition = "uniqueidentifier")
    private UUID cartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pd_id", nullable = false)
    private ProductDetails productDetails;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Constructors
    public Cart() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Cart(AppUser user, ProductDetails productDetails, Integer quantity) {
        this.user = user;
        this.productDetails = productDetails;
        this.quantity = quantity;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Helper method to calculate item total price
    public BigDecimal getItemTotal() {
        if (productDetails != null && productDetails.getProduct() != null) {
            return productDetails.getProduct().getPrice().multiply(new BigDecimal(quantity));
        }
        return BigDecimal.ZERO;
    }

    // Getters and Setters
    public UUID getCartId() {
        return cartId;
    }

    public void setCartId(UUID cartId) {
        this.cartId = cartId;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public ProductDetails getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(ProductDetails productDetails) {
        this.productDetails = productDetails;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

