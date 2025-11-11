package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "Brand")
public class Brand {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "brand_id", columnDefinition = "uniqueidentifier")
    private UUID id;

    @Column(name = "brand_name", unique = true, length = 255, columnDefinition = "nvarchar(255)")
    private String brandName;

    // Getters and setters
    public UUID getBrandId() {
        return id;
    }

    public void setBrandId(UUID brandId) {
        this.id = brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }
}
