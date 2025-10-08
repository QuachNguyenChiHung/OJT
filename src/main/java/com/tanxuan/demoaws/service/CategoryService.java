package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.CategoryDTO.CategoryRequest;
import com.tanxuan.demoaws.exception.CategoryException;
import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Validated
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> findAll() {
        try {
            return categoryRepository.findAll();
        } catch (Exception e) {
            throw new CategoryException("Error retrieving categories", e);
        }
    }

    public Category findById(Long id) {
        validateId(id);
        return categoryRepository.findById(id)
            .orElseThrow(() -> new CategoryException("Category not found with id: " + id));
    }

    public Category create(@Valid CategoryRequest request) {
        validateCategoryRequest(request);

        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new CategoryException("Category name already exists: " + request.getName());
        }

        try {
            Category category = new Category();
            category.setName(request.getName().trim());
            return categoryRepository.save(category);
        } catch (Exception e) {
            throw new CategoryException("Error creating category", e);
        }
    }

    public Category update(Long id, @Valid CategoryRequest request) {
        validateId(id);
        validateCategoryRequest(request);

        Category existing = findById(id);

        // Check if new name already exists (excluding current category)
        if (!existing.getName().equalsIgnoreCase(request.getName()) &&
            categoryRepository.existsByName(request.getName().trim())) {
            throw new CategoryException("Category name already exists: " + request.getName());
        }

        try {
            existing.setName(request.getName().trim());
            return categoryRepository.save(existing);
        } catch (Exception e) {
            throw new CategoryException("Error updating category with id: " + id, e);
        }
    }

    public void delete(Long id) {
        validateId(id);
        Category category = findById(id);

        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new CategoryException("Cannot delete category that has associated products");
        }

        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            throw new CategoryException("Error deleting category with id: " + id, e);
        }
    }

    public List<Category> findByNameContaining(String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return findAll();
            }
            return categoryRepository.findByNameContainingIgnoreCase(name.trim());
        } catch (Exception e) {
            throw new CategoryException("Error searching categories by name", e);
        }
    }

    private void validateId(Long id) {
        if (id == null) {
            throw new CategoryException("Category ID cannot be null");
        }
        if (id <= 0) {
            throw new CategoryException("Category ID must be positive");
        }
    }

    private void validateCategoryRequest(CategoryRequest request) {
        if (request == null) {
            throw new CategoryException("Category request cannot be null");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new CategoryException("Category name cannot be empty");
        }
        if (request.getName().length() > 255) {
            throw new CategoryException("Category name cannot exceed 255 characters");
        }
    }
}
