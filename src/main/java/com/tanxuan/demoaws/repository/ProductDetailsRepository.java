package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductDetailsRepository extends JpaRepository<ProductDetails, UUID> {

    // Find all product details by product ID
    List<ProductDetails> findByProductPId(UUID productId);

    // Find all product details by color ID
    List<ProductDetails> findByColorColorId(UUID colorId);

    // Find product details by product ID and color ID

    // Find product details by product ID and size
//    List<ProductDetails> findByProductPIdAndSize(UUID productId, String size);
//
//    // Find product details by product ID, color ID and size
//    Optional<ProductDetails> findByProductPIdAndColorColorIdAndSize(UUID productId, UUID colorId, String size);
//
//    // Count product details by product ID
//    Long countByProductPId(UUID productId);

    // Count product details by color ID
    Long countByColorColorId(UUID colorId);

    // Find all in-stock product details
    List<ProductDetails> findByInStockTrue();
}

