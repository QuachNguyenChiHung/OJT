package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
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
    public ResponseEntity<Product> create(@RequestBody Product product, @RequestParam Long categoryId) {
        Product created = productService.create(product, categoryId);
        return ResponseEntity.created(URI.create("/api/products/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product, @RequestParam(required = false) Long categoryId) {
        return productService.update(id, product, categoryId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


