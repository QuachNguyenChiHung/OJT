package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "ProductDetails")
public class ProductDetails {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "pd_id", columnDefinition = "uniqueidentifier")
    private UUID pdId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id")
    private Color color;

    @Column(name = "img_list", columnDefinition = "nvarchar(MAX)")
    private String imgList;

    @Column(name = "size", length = 10, columnDefinition = "nvarchar(10)")
    private String size;

    @Min(value = 0, message = "Amount cannot be negative")
    @Column(name = "amount")
    private Integer amount;

    @Column(name = "in_stock", columnDefinition = "bit")
    private Boolean inStock = true;

    // Constructors
    public ProductDetails() {}

    public ProductDetails(Product product, Color color, String size, Integer amount, Boolean inStock) {
        this.product = product;
        this.color = color;
        this.size = size;
        this.amount = amount;
        this.inStock = inStock;
    }

    // Getters and Setters
    public UUID getPdId() {
        return pdId;
    }

    public void setPdId(UUID pdId) {
        this.pdId = pdId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public String getImgList() {
        return imgList;
    }

    public void setImgList(String imgList) {
        this.imgList = imgList;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
}

