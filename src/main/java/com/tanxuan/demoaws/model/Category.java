package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "c_id")
    private Long id;

    @Column(name = "c_name", length = 255, nullable = false)
    private String name;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    // Constructor
    public Category() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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
