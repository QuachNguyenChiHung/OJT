package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.RatingDTO;
import com.tanxuan.demoaws.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RatingController {
    
    private final RatingService ratingService;
    
    // Get all ratings
    @GetMapping
    public ResponseEntity<List<RatingDTO>> getAllRatings() {
        List<RatingDTO> ratings = ratingService.getAllRatings();
        return ResponseEntity.ok(ratings);
    }
    
    // Get rating by ID
    @GetMapping("/{id}")
    public ResponseEntity<RatingDTO> getRatingById(@PathVariable Long id) {
        RatingDTO rating = ratingService.getRatingById(id);
        return ResponseEntity.ok(rating);
    }
    
    // Get ratings by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<RatingDTO>> getRatingsByProductId(@PathVariable Long productId) {
        List<RatingDTO> ratings = ratingService.getRatingsByProductId(productId);
        return ResponseEntity.ok(ratings);
    }
    
    // Get ratings by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingDTO>> getRatingsByUserId(@PathVariable Long userId) {
        List<RatingDTO> ratings = ratingService.getRatingsByUserId(userId);
        return ResponseEntity.ok(ratings);
    }
    
    // Get product rating statistics
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductRatingStats(@PathVariable Long productId) {
        Map<String, Object> stats = ratingService.getProductRatingStats(productId);
        return ResponseEntity.ok(stats);
    }
    
    // Create or update rating
    @PostMapping
    public ResponseEntity<RatingDTO> createOrUpdateRating(@Valid @RequestBody RatingDTO ratingDTO) {
        RatingDTO savedRating = ratingService.createOrUpdateRating(ratingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRating);
    }
    
    // Delete rating
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
    
    // Check if user has rated a product
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> hasUserRatedProduct(
            @RequestParam Long userId, 
            @RequestParam Long productId) {
        boolean hasRated = ratingService.hasUserRatedProduct(userId, productId);
        return ResponseEntity.ok(Map.of("hasRated", hasRated));
    }
}

