package com.tanxuan.demoaws.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tanxuan.demoaws.dto.ProductDetailsDTO;
import com.tanxuan.demoaws.service.ImageUploadService;
import com.tanxuan.demoaws.service.ProductDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/product-details")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductDetailsController {

    private final ProductDetailsService productDetailsService;
    private final ImageUploadService imageUploadService;
    private final ObjectMapper objectMapper;

    // Get all product details
    @GetMapping
    public ResponseEntity<List<ProductDetailsDTO>> getAllProductDetails() {
        List<ProductDetailsDTO> productDetails = productDetailsService.getAllProductDetails();
        return ResponseEntity.ok(productDetails);
    }

    // Get product details by ID
    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<ProductDetailsDTO> getProductDetailsById(@PathVariable UUID id) {
        ProductDetailsDTO productDetails = productDetailsService.getProductDetailsById(id);
        return ResponseEntity.ok(productDetails);
    }

    // Get product details by product ID
    @GetMapping("/product/{productId:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<List<ProductDetailsDTO>> getProductDetailsByProductId(@PathVariable UUID productId) {
        List<ProductDetailsDTO> productDetails = productDetailsService.getProductDetailsByProductId(productId);
        return ResponseEntity.ok(productDetails);
    }


    // Create product details
    @PostMapping
    public ResponseEntity<ProductDetailsDTO> createProductDetails(@Valid @RequestBody ProductDetailsDTO productDetailsDTO) {
        ProductDetailsDTO createdProductDetails = productDetailsService.createProductDetails(productDetailsDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProductDetails);
    }

    // Update product details
    @PutMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<ProductDetailsDTO> updateProductDetails(
            @PathVariable UUID id,
            @Valid @RequestBody ProductDetailsDTO productDetailsDTO) {
        ProductDetailsDTO updatedProductDetails = productDetailsService.updateProductDetails(id, productDetailsDTO);
        return ResponseEntity.ok(updatedProductDetails);
    }

    // Delete product details
    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<Void> deleteProductDetails(@PathVariable UUID id) {
        productDetailsService.deleteProductDetails(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload/Update images for product details
     * POST /api/product-details/{id}/images
     * @param id Product details ID
     * @param files Array of exactly 5 image files (use null/empty for unchanged positions)
     * @return Updated product details with new image URLs
     *
     * Usage:
     * - Initial upload: Send 5 new images
     * - Update specific images: Send 5 files where unchanged positions can be marked (or send all 5)
     *
     * Note: This endpoint expects exactly 5 images. If updating, send new files for positions
     * you want to change, and the existing URLs will be preserved for other positions.
     */
    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/images")
    public ResponseEntity<Map<String, Object>> uploadProductImages(
            @PathVariable UUID id,
            @RequestParam("files") MultipartFile[] files) {
        try {
            // Validate exactly 5 files are provided
            if (files == null || files.length != 5) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Exactly 5 images are required. Received: " + (files == null ? 0 : files.length));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Get existing product details
            ProductDetailsDTO productDetails = productDetailsService.getProductDetailsById(id);

            // Parse existing image URLs (if any)
            String[] existingUrls = new String[5];
            if (productDetails.getImgList() != null && !productDetails.getImgList().isEmpty()) {
                try {
                    String[] parsedUrls = objectMapper.readValue(productDetails.getImgList(), String[].class);
                    // Copy existing URLs, pad with nulls if less than 5
                    for (int i = 0; i < Math.min(parsedUrls.length, 5); i++) {
                        existingUrls[i] = parsedUrls[i];
                    }
                } catch (JsonProcessingException e) {
                    // If parsing fails, start fresh
                    System.err.println("Failed to parse existing image list: " + e.getMessage());
                }
            }

            // Process each of the 5 positions
            String[] finalUrls = new String[5];
            List<String> deletedUrls = new ArrayList<>();

            for (int i = 0; i < 5; i++) {
                MultipartFile file = files[i];

                // Check if this position has a new file
                if (file != null && !file.isEmpty()) {
                    // Upload new image
                    String newUrl = imageUploadService.uploadImage(file);
                    finalUrls[i] = newUrl;

                    // Mark old URL for deletion if it exists and is different
                    if (existingUrls[i] != null && !existingUrls[i].isEmpty()) {
                        deletedUrls.add(existingUrls[i]);
                    }
                } else {
                    // Keep existing URL if no new file provided
                    if (existingUrls[i] != null && !existingUrls[i].isEmpty()) {
                        finalUrls[i] = existingUrls[i];
                    } else {
                        // Position is empty and no new file - error
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("success", false);
                        errorResponse.put("message", "Position " + (i + 1) + " is empty. All 5 positions must have images.");
                        return ResponseEntity.badRequest().body(errorResponse);
                    }
                }
            }

            // Delete old images from S3
            for (String oldUrl : deletedUrls) {
                try {
                    imageUploadService.deleteImage(oldUrl);
                } catch (Exception e) {
                    System.err.println("Failed to delete old image: " + oldUrl + " - " + e.getMessage());
                }
            }

            // Convert final URLs array to JSON string
            String imgListJson;
            try {
                imgListJson = objectMapper.writeValueAsString(finalUrls);
            } catch (JsonProcessingException e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Failed to convert image URLs to JSON: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }

            // Update product details with new image list
            productDetails.setImgList(imgListJson);
            ProductDetailsDTO updatedProductDetails = productDetailsService.updateProductDetails(id, productDetails);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Images uploaded successfully");
            response.put("productDetailsId", id);
            response.put("imageUrls", finalUrls);
            response.put("imgListJson", imgListJson);
            response.put("deletedCount", deletedUrls.size());
            response.put("deletedUrls", deletedUrls);
            response.put("productDetails", updatedProductDetails);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to upload images: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

