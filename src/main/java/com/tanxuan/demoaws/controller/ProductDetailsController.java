package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.ProductDetailsDTO;
import com.tanxuan.demoaws.service.ProductDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-details")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductDetailsController {

    private final ProductDetailsService productDetailsService;

    // Get all product details
    @GetMapping
    public ResponseEntity<List<ProductDetailsDTO>> getAllProductDetails() {
        List<ProductDetailsDTO> productDetails = productDetailsService.getAllProductDetails();
        return ResponseEntity.ok(productDetails);
    }

    // Get product details by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailsDTO> getProductDetailsById(@PathVariable UUID id) {
        ProductDetailsDTO productDetails = productDetailsService.getProductDetailsById(id);
        return ResponseEntity.ok(productDetails);
    }

    // Get product details by product ID
    @GetMapping("/product/{productId}")
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
    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailsDTO> updateProductDetails(
            @PathVariable UUID id,
            @Valid @RequestBody ProductDetailsDTO productDetailsDTO) {
        ProductDetailsDTO updatedProductDetails = productDetailsService.updateProductDetails(id, productDetailsDTO);
        return ResponseEntity.ok(updatedProductDetails);
    }

    // Delete product details
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductDetails(@PathVariable UUID id) {
        productDetailsService.deleteProductDetails(id);
        return ResponseEntity.noContent().build();
    }
}

