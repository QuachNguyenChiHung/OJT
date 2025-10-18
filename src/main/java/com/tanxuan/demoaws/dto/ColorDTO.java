package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public class ColorDTO {
    private UUID colorId;

    @NotBlank(message = "Color name is required")
    private String colorName;

    @NotBlank(message = "Color code is required")
    private String colorCode;

    // Constructors
    public ColorDTO() {}

    public ColorDTO(UUID colorId, String colorName, String colorCode) {
        this.colorId = colorId;
        this.colorName = colorName;
        this.colorCode = colorCode;
    }

    // Getters and Setters
    public UUID getColorId() {
        return colorId;
    }

    public void setColorId(UUID colorId) {
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
}

