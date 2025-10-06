package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.repository.CategoryRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> findAll() { return productRepository.findAll(); }

    public Product findById(Long id) { return productRepository.findById(id).orElseThrow(); }

    public Product create(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated, Long categoryId) {
        Product existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setStock(updated.getStock());
        existing.setImageUrl(updated.getImageUrl());
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId).orElseThrow();
            existing.setCategory(category);
        }
        return productRepository.save(existing);
    }

    public void delete(Long id) { productRepository.deleteById(id); }
}


