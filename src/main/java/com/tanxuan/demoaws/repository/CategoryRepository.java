package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}


