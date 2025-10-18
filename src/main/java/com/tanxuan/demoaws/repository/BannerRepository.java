package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BannerRepository extends JpaRepository<Banner, UUID> {
    List<Banner> findByIsActiveTrue();
    List<Banner> findByTitleContainingIgnoreCase(String title);
    List<Banner> findByUserUserId(UUID userId);
}
