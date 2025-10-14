package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.RatingDTO;
import com.tanxuan.demoaws.exception.ResourceNotFoundException;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.model.Rating;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import com.tanxuan.demoaws.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RatingService {
    
    private final RatingRepository ratingRepository;
    private final AppUserRepository appUserRepository;
    private final ProductRepository productRepository;
    
    // Get all ratings
    public List<RatingDTO> getAllRatings() {
        return ratingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get rating by ID
    public RatingDTO getRatingById(Long id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + id));
        return convertToDTO(rating);
    }
    
    // Get ratings by product ID
    public List<RatingDTO> getRatingsByProductId(Long productId) {
        return ratingRepository.findByProductId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get ratings by user ID
    public List<RatingDTO> getRatingsByUserId(Long userId) {
        return ratingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get product rating statistics
    public Map<String, Object> getProductRatingStats(Long productId) {
        Double avgRating = ratingRepository.getAverageRatingByProductId(productId);
        Long totalRatings = ratingRepository.countByProductId(productId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avgRating != null ? avgRating : 0.0);
        stats.put("totalRatings", totalRatings);
        
        return stats;
    }
    
    // Create or update rating
    public RatingDTO createOrUpdateRating(RatingDTO ratingDTO) {
        AppUser user = appUserRepository.findById(ratingDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ratingDTO.getUserId()));
        
        Product product = productRepository.findById(ratingDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + ratingDTO.getProductId()));
        
        // Check if user already rated this product
        Rating rating = ratingRepository.findByUserIdAndProductId(ratingDTO.getUserId(), ratingDTO.getProductId())
                .orElse(new Rating());
        
        rating.setRatingValue(ratingDTO.getRatingValue());
        rating.setUser(user);
        rating.setProduct(product);
        
        Rating savedRating = ratingRepository.save(rating);
        return convertToDTO(savedRating);
    }
    
    // Delete rating
    public void deleteRating(Long id) {
        if (!ratingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rating not found with id: " + id);
        }
        ratingRepository.deleteById(id);
    }
    
    // Check if user has rated a product
    public boolean hasUserRatedProduct(Long userId, Long productId) {
        return ratingRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    // Convert Entity to DTO
    private RatingDTO convertToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setId(rating.getId());
        dto.setRatingValue(rating.getRatingValue());
        dto.setUserId(rating.getUser().getId());
        dto.setUserName(rating.getUser().getFullName());
        dto.setProductId(rating.getProduct().getId());
        dto.setProductName(rating.getProduct().getName());
        
        if (rating.getCreatedAt() != null) {
            dto.setCreatedAt(rating.getCreatedAt().toString());
        }
        
        return dto;
    }
}

