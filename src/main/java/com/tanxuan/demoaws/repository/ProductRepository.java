package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByCategoryCId(UUID categoryId);
    List<Product> findByBrandId(UUID brandId);
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<Product> findByPNameContainingIgnoreCase(String name);
}
