package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {

    // Find all ratings by product ID
    List<Rating> findByProductPId(UUID productId);

    // Find all ratings by user ID
    List<Rating> findByUserUserId(UUID userId);

    // Find rating by user and product
    Optional<Rating> findByUserUserIdAndProductPId(UUID userId, UUID productId);

    // Calculate average rating for a product
    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.product.PId = :productId")
    Double getAverageRatingByProductPId(@Param("productId") UUID productId);

    // Count ratings for a product
    Long countByProductPId(UUID productId);

    // Check if user has rated a product
    boolean existsByUserUserIdAndProductPId(UUID userId, UUID productId);
}

