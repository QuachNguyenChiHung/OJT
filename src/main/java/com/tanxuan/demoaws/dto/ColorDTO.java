package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;

public class ColorDTO {
    private Long id;
    
    @NotBlank(message = "Color name is required")
    private String colorName;
    
    @NotBlank(message = "Color code is required")
    private String colorCode;
    
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public ColorDTO() {}
    
    public ColorDTO(Long id, String colorName, String colorCode) {
        this.id = id;
        this.colorName = colorName;
        this.colorCode = colorCode;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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

