package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductDetailsRepository extends JpaRepository<ProductDetails, Long> {
    
    // Find all product details by product ID
    List<ProductDetails> findByProductId(Long productId);
    
    // Find all product details by color ID
    List<ProductDetails> findByColorId(Long colorId);
    
    // Find product details by product ID and color ID
    Optional<ProductDetails> findByProductIdAndColorId(Long productId, Long colorId);
    
    // Find product details by product ID and size
    List<ProductDetails> findByProductIdAndSize(Long productId, String size);
    
    // Find product details by product ID, color ID and size
    Optional<ProductDetails> findByProductIdAndColorIdAndSize(Long productId, Long colorId, String size);
    
    // Count product details by product ID
    Long countByProductId(Long productId);
}

