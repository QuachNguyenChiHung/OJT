package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.ProductDTO;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.model.Rating;
import com.tanxuan.demoaws.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDTO.ProductResponse> all(Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        return productService.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProductDTO.ProductResponse one(@PathVariable UUID id) {
        return convertToDTO(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDTO.ProductResponse> create(
            @Valid @RequestBody ProductDTO.ProductRequest productRequest) {
        Product product = new Product();
        product.setPName(productRequest.getName());
        product.setPDesc(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setIsActive(productRequest.getIsActive());
        Product created = productService.create(product, productRequest.getCategoryId(), productRequest.getBrandId());
        return ResponseEntity.created(URI.create("/api/products/" + created.getPId()))
            .body(convertToDTO(created));
    }

    @PutMapping("/{id}")
    public ProductDTO.ProductResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody Map<String, Object> body,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID brandId) {
        for(Map.Entry<String,Object> entry : body.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        Product p=new Product();
        System.out.println(Boolean.parseBoolean(body.get("isActive").toString()));
            p.setPrice(body.get("price") != null ? new BigDecimal(body.get("price").toString()) : null);
            p.setPName(body.get("PName") != null ? body.get("PName").toString() : null);
            p.setPDesc(body.get("pDesc") != null ? body.get("pDesc").toString() : null);
            p.setIsActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : false);
        return convertToDTO(productService.update(id, p, categoryId, brandId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductDTO.ProductResponse> getByCategory(@PathVariable UUID categoryId, Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        return productService.findByCategoryForUser(categoryId, isAdmin).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/brand/{brandId}")
    public List<ProductDTO.ProductResponse> getByBrand(@PathVariable UUID brandId, Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        return productService.findByBrandForUser(brandId, isAdmin).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/price-range")
    public List<ProductDTO.ProductResponse> getByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        return productService.findByPriceRangeForUser(minPrice, maxPrice, isAdmin).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/search")
    public List<ProductDTO.ProductResponse> searchProducts(@RequestParam String name, Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        return productService.findByNameContainingForUser(name, isAdmin).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // Helper method to check if user is admin
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    // Helper method to convert Entity to DTO
    private ProductDTO.ProductResponse convertToDTO(Product product) {
        // compute average rating if available
        Double averageRating = null;
        List<Rating> ratings = product.getRatings();
        int ratingsCount = 0;
        if (ratings != null && !ratings.isEmpty()) {
            ratingsCount = ratings.size();
            averageRating = ratings.stream()
                .mapToInt(Rating::getRatingValue)
                .average()
                .orElse(0.0);
        }

        return new ProductDTO.ProductResponse(
            product.getPId(),
            product.getPName(),
            product.getPDesc(),
            product.getPrice(),
            product.getCategory() != null ? product.getCategory().getCName() : null,
            product.getBrand() != null ? product.getBrand().getBrandName() : null,
                product.getIsActive(),
            productService.productIsInStock(product.getPId()), // isAvailable - default value
            averageRating,
            ratingsCount
        );
    }
}
