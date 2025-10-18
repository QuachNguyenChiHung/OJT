package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> all() { return productService.findAll(); }

    @GetMapping("/{id}")
    public Product one(@PathVariable UUID id) { return productService.findById(id); }

    @PostMapping
    public ResponseEntity<Product> create(
            @Valid @RequestBody Product product,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID brandId) {
        Product created = productService.create(product, categoryId, brandId);
        return ResponseEntity.created(URI.create("/api/products/" + created.getPId())).body(created);
    }

    @PutMapping("/{id}")
    public Product update(
            @PathVariable UUID id,
            @Valid @RequestBody Product product,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID brandId) {
        return productService.update(id, product, categoryId, brandId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getByCategory(@PathVariable UUID categoryId) {
        return productService.findByCategory(categoryId);
    }

    @GetMapping("/brand/{brandId}")
    public List<Product> getByBrand(@PathVariable UUID brandId) {
        return productService.findByBrand(brandId);
    }

    @GetMapping("/price-range")
    public List<Product> getByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        return productService.findByPriceRange(minPrice, maxPrice);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productService.findByNameContaining(name);
    }
}

