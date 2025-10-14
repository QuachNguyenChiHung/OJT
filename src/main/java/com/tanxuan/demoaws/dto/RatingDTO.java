package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;

public class RatingDTO {
    private Long id;
    
    @NotNull(message = "Rating value is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer ratingValue;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userName;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    private String productName;
    
    private String createdAt;
    
    // Constructors
    public RatingDTO() {}
    
    public RatingDTO(Long id, Integer ratingValue, Long userId, String userName, Long productId, String productName) {
        this.id = id;
        this.ratingValue = ratingValue;
        this.userId = userId;
        this.userName = userName;
        this.productId = productId;
        this.productName = productName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getRatingValue() {
        return ratingValue;
    }
    
    public void setRatingValue(Integer ratingValue) {
        this.ratingValue = ratingValue;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
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
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}

