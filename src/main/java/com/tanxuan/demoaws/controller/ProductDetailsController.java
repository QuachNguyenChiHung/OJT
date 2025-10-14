package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.ProductDetailsDTO;
import com.tanxuan.demoaws.service.ProductDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ProductDetailsDTO> getProductDetailsById(@PathVariable Long id) {
        ProductDetailsDTO productDetails = productDetailsService.getProductDetailsById(id);
        return ResponseEntity.ok(productDetails);
    }
    
    // Get product details by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductDetailsDTO>> getProductDetailsByProductId(@PathVariable Long productId) {
        List<ProductDetailsDTO> productDetails = productDetailsService.getProductDetailsByProductId(productId);
        return ResponseEntity.ok(productDetails);
    }
    
    // Get product details by color ID
    @GetMapping("/color/{colorId}")
    public ResponseEntity<List<ProductDetailsDTO>> getProductDetailsByColorId(@PathVariable Long colorId) {
        List<ProductDetailsDTO> productDetails = productDetailsService.getProductDetailsByColorId(colorId);
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
            @PathVariable Long id, 
            @Valid @RequestBody ProductDetailsDTO productDetailsDTO) {
        ProductDetailsDTO updatedProductDetails = productDetailsService.updateProductDetails(id, productDetailsDTO);
        return ResponseEntity.ok(updatedProductDetails);
    }
    
    // Delete product details
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductDetails(@PathVariable Long id) {
        productDetailsService.deleteProductDetails(id);
        return ResponseEntity.noContent().build();
    }
}

