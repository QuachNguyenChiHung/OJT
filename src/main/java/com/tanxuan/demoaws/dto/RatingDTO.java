package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public class RatingDTO {
    private UUID id;

    @NotNull(message = "Rating value is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer ratingValue;

    @NotNull(message = "User ID is required")
    private UUID userId;

    private String userName;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private String productName;

    // Constructors
    public RatingDTO() {}

    public RatingDTO(UUID id, Integer ratingValue, UUID userId, String userName, UUID productId, String productName) {
        this.id = id;
        this.ratingValue = ratingValue;
        this.userId = userId;
        this.userName = userName;
        this.productId = productId;
        this.productName = productName;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getRatingValue() {
        return ratingValue;
    }

    public void setRatingValue(Integer ratingValue) {
        this.ratingValue = ratingValue;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}

