package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

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
    public Product one(@PathVariable Long id) { return productService.findById(id); }

    @PostMapping
    public ResponseEntity<Product> create(
            @Valid @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId) {
        Product created = productService.create(product, categoryId, brandId);
        return ResponseEntity.created(URI.create("/api/products/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public Product update(
            @PathVariable Long id,
            @Valid @RequestBody Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId) {
        return productService.update(id, product, categoryId, brandId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getByCategory(@PathVariable Long categoryId) {
        return productService.findByCategory(categoryId);
    }

    @GetMapping("/brand/{brandId}")
    public List<Product> getByBrand(@PathVariable Long brandId) {
        return productService.findByBrand(brandId);
    }

    @GetMapping("/price-range")
    public List<Product> getByPriceRange(
            @RequestParam Float minPrice,
            @RequestParam Float maxPrice) {
        return productService.findByPriceRange(minPrice, maxPrice);
    }

    @GetMapping("/available")
    public List<Product> getAvailableProducts() {
        return productService.findAvailableProducts();
    }
}
