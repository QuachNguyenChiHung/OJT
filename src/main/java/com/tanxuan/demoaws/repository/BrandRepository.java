package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BrandRepository extends JpaRepository<Brand, UUID> {
    boolean existsByBrandName(String brandName);
    Optional<Brand> findByBrandName(String brandName);
}
