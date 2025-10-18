package com.tanxuan.demoaws.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class CategoryDTO {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryRequest {
        @NotBlank(message = "Category name is required")
        @Size(max = 255, message = "Category name cannot exceed 255 characters")
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private UUID id;
        private String name;
        private int productCount;
    }
}
