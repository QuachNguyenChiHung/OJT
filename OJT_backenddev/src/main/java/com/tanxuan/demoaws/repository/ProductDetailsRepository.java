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


    // Find all in-stock product details
    List<ProductDetails> findByInStockTrue();
}

