package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() { return categoryRepository.findAll(); }

    public Category findById(Long id) { return categoryRepository.findById(id).orElseThrow(); }

    public Category create(Category category) { return categoryRepository.save(category); }

    public Category update(Long id, Category updated) {
        Category existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) { categoryRepository.deleteById(id); }
}


