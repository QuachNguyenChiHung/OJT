package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public class ProductDetailsDTO {
    private UUID pdId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private String productName;


    private String colorName;

    private String colorCode;

    private String imgList;

    private String size;

    @Min(value = 0, message = "Amount cannot be negative")
    private Integer amount;

    private Boolean inStock;

    // Constructors
    public ProductDetailsDTO() {}

    public ProductDetailsDTO(UUID pdId, UUID productId, String productName,
                            String colorName, String colorCode, String size,
                            Integer amount, Boolean inStock) {
        this.pdId = pdId;
        this.productId = productId;
        this.productName = productName;
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

