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

    @Column(name = "color_name", length = 64, columnDefinition = "nvarchar(64)")
    private String colorName;

    @Column(name = "color_code", length = 64, columnDefinition = "nvarchar(64)")
    private String colorCode;

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

    public ProductDetails(Product product, String colorName, String colorCode, String size, Integer amount, Boolean inStock) {
        this.product = product;
        this.colorName = colorName;
        this.colorCode = colorCode;
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

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }

    public String getColorCode() {
        return colorCode;
    }

    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
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

