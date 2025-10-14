package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductDetailsDTO {
    private Long id;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    private String productName;
    
    private Long colorId;
    
    private String colorName;
    
    private String colorCode;
    
    private String imgList;
    
    private String size;
    
    @Min(value = 0, message = "Amount cannot be negative")
    private Integer amount;
    
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private String status;
    
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public ProductDetailsDTO() {}
    
    public ProductDetailsDTO(Long id, Long productId, String productName, Long colorId, 
                            String colorName, String colorCode, String size, 
                            Integer amount, BigDecimal price, String status) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.colorId = colorId;
        this.colorName = colorName;
        this.colorCode = colorCode;
        this.size = size;
        this.amount = amount;
        this.price = price;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public Long getColorId() {
        return colorId;
    }
    
    public void setColorId(Long colorId) {
        this.colorId = colorId;
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
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}

