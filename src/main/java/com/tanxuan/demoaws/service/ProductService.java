package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Brand;
import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.repository.BrandRepository;
import com.tanxuan.demoaws.repository.CategoryRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductService(ProductRepository productRepository,
                        CategoryRepository categoryRepository,
                        BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    public List<Product> findAll() { return productRepository.findAll(); }

    public Product findById(Long id) { return productRepository.findById(id).orElseThrow(); }

    public Product create(Product product, Long categoryId, Long brandId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        if (brandId != null) {
            Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated, Long categoryId, Long brandId) {
        Product existing = findById(id);
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setAmount(updated.getAmount());
        existing.setImgList(updated.getImgList());
        existing.setSize(updated.getSize());
        existing.setColor(updated.getColor());
        existing.setStatus(updated.getStatus());

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(category);
        }
        if (brandId != null) {
            Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
            existing.setBrand(brand);
        }
        return productRepository.save(existing);
    }

    public void delete(Long id) { productRepository.deleteById(id); }

    public List<Product> findByCategory(Long categoryId) {
        return productRepository.findByCategory_Id(categoryId);
    }

    public List<Product> findByBrand(Long brandId) {
        return productRepository.findByBrand_Id(brandId);
    }

    public List<Product> findByPriceRange(Float minPrice, Float maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Product> findAvailableProducts() {
        return productRepository.findByStatusAndAmountGreaterThan("AVAILABLE", 0);
    }
}
