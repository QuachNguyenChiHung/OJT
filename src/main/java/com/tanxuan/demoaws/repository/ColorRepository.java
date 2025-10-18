package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ColorRepository extends JpaRepository<Color, UUID> {

    // Find color by name
    Optional<Color> findByColorName(String colorName);

    // Find color by code
    Optional<Color> findByColorCode(String colorCode);

    // Check if color name exists
    boolean existsByColorName(String colorName);

    // Check if color code exists
    boolean existsByColorCode(String colorCode);
}

