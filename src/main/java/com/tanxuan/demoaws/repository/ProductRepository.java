package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}


