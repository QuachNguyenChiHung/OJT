package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Brand;
import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.model.ProductDetails;
import com.tanxuan.demoaws.repository.BrandRepository;
import com.tanxuan.demoaws.repository.CategoryRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductDetailsRepository productDetailsRepository;
    public ProductService(ProductRepository productRepository,
                        CategoryRepository categoryRepository,
                        BrandRepository brandRepository, ProductDetailsRepository productDetailsRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productDetailsRepository = productDetailsRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(UUID id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product create(Product product, UUID categoryId, UUID brandId) {
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

    public Product update(UUID id, Product updated, UUID categoryId, UUID brandId) {
        Product existing = findById(id);
        existing.setPName(updated.getPName());
        existing.setPDesc(updated.getPDesc());
        existing.setPrice(updated.getPrice());

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

    public void delete(UUID id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    public boolean productIsInStock(UUID productId) {
        List<ProductDetails> p=this.productDetailsRepository.findByProductPId(productId);
        boolean isInStock=false;
        for(ProductDetails pd :p){
            if(pd.getInStock()){
                isInStock=true;
                break;
            }
        }
        return isInStock;
    }
    public List<Product> findByCategory(UUID categoryId) {
        return productRepository.findByCategoryCId(categoryId);
    }

    public List<Product> findByBrand(UUID brandId) {
        return productRepository.findByBrandId(brandId);
    }

    public List<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Product> findByNameContaining(String name) {
        return productRepository.findByPNameContainingIgnoreCase(name);
    }
}
