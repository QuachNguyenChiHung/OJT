package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory_Id(Long categoryId);
    List<Product> findByBrand_Id(Long brandId);
    List<Product> findByPriceBetween(Float minPrice, Float maxPrice);
    List<Product> findByStatusAndAmountGreaterThan(String status, Integer minAmount);
}
