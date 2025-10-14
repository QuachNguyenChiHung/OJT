package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Color")
public class Color extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "color_id")
    private Long id;

    @NotBlank(message = "Color name is required")
    @Column(name = "color_name", nullable = false, length = 64)
    private String colorName;

    @NotBlank(message = "Color code is required")
    @Column(name = "color_code", nullable = false, length = 64)
    private String colorCode;

    @OneToMany(mappedBy = "color", cascade = CascadeType.ALL)
    private List<ProductDetails> productDetails = new ArrayList<>();

    // Constructors
    public Color() {}

    public Color(String colorName, String colorCode) {
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

    public List<ProductDetails> getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(List<ProductDetails> productDetails) {
        this.productDetails = productDetails;
    }
}

