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

    public List<Product> findAllForUser(boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findAll();
        }
        return productRepository.findByIsActive(true);
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
        // Only overwrite fields if the client provided them (non-null)
        if (updated.getPName() != null) {
            existing.setPName(updated.getPName());
        }
        if (updated.getPDesc() != null) {
            existing.setPDesc(updated.getPDesc());
        }
        if (updated.getPrice() != null) {
            existing.setPrice(updated.getPrice());
        }
        if (updated.getIsActive() != null) {
            existing.setIsActive(updated.getIsActive());
        }
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

    public List<Product> findByCategoryForUser(UUID categoryId, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByCategoryCId(categoryId);
        }
        return productRepository.findByCategoryCIdAndIsActive(categoryId, true);
    }

    public List<Product> findByBrand(UUID brandId) {
        return productRepository.findByBrandId(brandId);
    }

    public List<Product> findByBrandForUser(UUID brandId, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByBrandId(brandId);
        }
        return productRepository.findByBrandIdAndIsActive(brandId, true);
    }

    public List<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Product> findByPriceRangeForUser(BigDecimal minPrice, BigDecimal maxPrice, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByPriceBetween(minPrice, maxPrice);
        }
        return productRepository.findByPriceBetweenAndIsActive(minPrice, maxPrice, true);
    }

    public List<Product> findByNameContaining(String name) {
        return productRepository.findByPNameContainingIgnoreCase(name);
    }

    public List<Product> findByNameContainingForUser(String name, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByPNameContainingIgnoreCase(name);
        }
        return productRepository.findByPNameContainingIgnoreCaseAndIsActive(name, true);
    }
}
