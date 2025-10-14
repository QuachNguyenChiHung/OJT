package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.CategoryDTO.CategoryRequest;
import com.tanxuan.demoaws.dto.CategoryDTO.CategoryResponse;
import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.findAll().stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable Long id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok(toCategoryResponse(category));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category created = categoryService.create(request);
        return ResponseEntity.created(URI.create("/api/categories/" + created.getId()))
                .body(toCategoryResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        Category updated = categoryService.update(id, request);
        return ResponseEntity.ok(toCategoryResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponse>> searchCategories(
            @RequestParam(required = false) String name) {
        List<CategoryResponse> categories = categoryService.findByNameContaining(name).stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getProducts() != null ? category.getProducts().size() : 0
        );
    }
}
