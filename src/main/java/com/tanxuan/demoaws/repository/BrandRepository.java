package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByBrandName(String brandName);
}
