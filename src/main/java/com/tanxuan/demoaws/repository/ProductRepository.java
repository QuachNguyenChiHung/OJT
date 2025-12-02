package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByCategoryCId(UUID categoryId);
    List<Product> findByBrandId(UUID brandId);
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    List<Product> findByPNameContainingIgnoreCase(String name);

    // Methods for filtering by isActive status
    List<Product> findByIsActive(Boolean isActive);
    List<Product> findByCategoryCIdAndIsActive(UUID categoryId, Boolean isActive);
    List<Product> findByBrandIdAndIsActive(UUID brandId, Boolean isActive);
    List<Product> findByPriceBetweenAndIsActive(BigDecimal minPrice, BigDecimal maxPrice, Boolean isActive);
    List<Product> findByPNameContainingIgnoreCaseAndIsActive(String name, Boolean isActive);

    // Find best-selling products ordered by total quantity sold
    @Query("SELECT p FROM Product p " +
           "JOIN p.productDetails pd " +
           "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
           "JOIN od.order o " +
           "WHERE o.status = 'Completed' " +
           "GROUP BY p.PId " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Product> findBestSellingProducts();

    // Find best-selling products with isActive filter
    @Query("SELECT p FROM Product p " +
           "JOIN p.productDetails pd " +
           "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
           "JOIN od.order o " +
           "WHERE o.status = 'Completed' AND p.isActive = :isActive " +
           "GROUP BY p.PId " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Product> findBestSellingProductsByActiveStatus(Boolean isActive);
}
