package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Product")
public class Product {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "p_id", columnDefinition = "uniqueidentifier")
    private UUID PId;

    @Column(name = "p_name", columnDefinition = "nvarchar(255)")
    private String PName;

    @Column(name = "p_desc", columnDefinition = "nvarchar(MAX)")
    private String pDesc;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "c_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Rating> ratings = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductDetails> productDetails = new ArrayList<>();

    // Getters and setters
    public UUID getPId() { return PId; }
    public void setPId(UUID pId) { this.PId = pId; }

    public String getPName() { return PName; }
    public void setPName(String pName) { this.PName = pName; }

    public String getPDesc() { return pDesc; }
    public void setPDesc(String pDesc) { this.pDesc = pDesc; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }

    public List<Rating> getRatings() { return ratings; }
    public void setRatings(List<Rating> ratings) { this.ratings = ratings; }

    public List<ProductDetails> getProductDetails() { return productDetails; }
    public void setProductDetails(List<ProductDetails> productDetails) { this.productDetails = productDetails; }
}
