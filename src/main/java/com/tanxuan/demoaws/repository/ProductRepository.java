package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    @Query("SELECT p.PId FROM Product p " +
            "JOIN p.productDetails pd " +
            "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
            "JOIN od.order o " +
            "WHERE o.status = 'DELIVERED' " +
            "GROUP BY p.PId " +
            "ORDER BY SUM(od.quantity) DESC")
    List<UUID> findBestSellingProductIds();

    // Find best-selling products with isActive filter
    @Query("SELECT p.PId FROM Product p " +
            "JOIN p.productDetails pd " +
            "JOIN OrderDetails od ON od.productDetails.pdId = pd.pdId " +
            "JOIN od.order o " +
            "WHERE o.status = 'DELIVERED' AND p.isActive = :isActive " +
            "GROUP BY p.PId " +
            "ORDER BY SUM(od.quantity) DESC")
    List<UUID> findBestSellingProductIdsByActiveStatus(@Param("isActive") Boolean isActive);

    // Find newest products ordered by product ID (as proxy for creation order)
    @Query("SELECT p FROM Product p ORDER BY p.PId DESC")
    List<Product> findNewestProducts();

    // Find newest products with isActive filter
    @Query("SELECT p FROM Product p WHERE p.isActive = :isActive ORDER BY p.PId DESC")
    List<Product> findNewestProductsByActiveStatus(@Param("isActive") Boolean isActive);
}
