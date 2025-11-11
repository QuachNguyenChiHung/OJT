package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Color")
public class Color {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "color_id", columnDefinition = "uniqueidentifier")
    private UUID colorId;

    @Column(name = "color_name", length = 64, columnDefinition = "nvarchar(64)")
    private String colorName;

    @Column(name = "color_code", length = 64, columnDefinition = "nvarchar(64)")
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

    public List<ProductDetails> getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(List<ProductDetails> productDetails) {
        this.productDetails = productDetails;
    }
}

