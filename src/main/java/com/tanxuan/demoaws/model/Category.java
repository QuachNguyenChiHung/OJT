package com.tanxuan.demoaws.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Category")
public class Category {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "c_id", columnDefinition = "uniqueidentifier")
    private UUID CId;

    @Column(name = "c_name", length = 255, unique = true, columnDefinition = "nvarchar(255)")
    private String CName;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"category", "brand", "ratings", "productDetails", "hibernateLazyInitializer", "handler"})
    private List<Product> products = new ArrayList<>();

    // Constructor
    public Category() {
    }

    // Getters and Setters
    public UUID getCId() { return CId; }
    public void setCId(UUID cId) { this.CId = cId; }

    public String getCName() { return CName; }
    public void setCName(String cName) { this.CName = cName; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    // Helper methods
    public void addProduct(Product product) {
        if (product != null) {
            products.add(product);
            product.setCategory(this);
        }
    }

    public void removeProduct(Product product) {
        if (product != null) {
            products.remove(product);
            product.setCategory(null);
        }
    }
}
