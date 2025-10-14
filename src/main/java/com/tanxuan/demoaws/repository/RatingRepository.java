package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    
    // Find all ratings by product ID
    List<Rating> findByProductId(Long productId);
    
    // Find all ratings by user ID
    List<Rating> findByUserId(Long userId);
    
    // Find rating by user and product
    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);
    
    // Calculate average rating for a product
    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    // Count ratings for a product
    Long countByProductId(Long productId);
    
    // Check if user has rated a product
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}

