package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.exception.BannerException;
import com.tanxuan.demoaws.model.Banner;
import com.tanxuan.demoaws.repository.BannerRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Transactional
@Validated
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository bannerRepository;

    public List<Banner> findAll() {
        try {
            return bannerRepository.findAll();
        } catch (Exception e) {
            throw new BannerException("Error retrieving banners", e);
        }
    }

    public Banner findById(Long id) {
        try {
            return bannerRepository.findById(id)
                .orElseThrow(() -> new BannerException("Banner not found with id: " + id));
        } catch (BannerException e) {
            throw e;
        } catch (Exception e) {
            throw new BannerException("Error retrieving banner with id: " + id, e);
        }
    }

    public List<Banner> findActiveBanners() {
        try {
            return bannerRepository.findByIsActiveTrue();
        } catch (Exception e) {
            throw new BannerException("Error retrieving active banners", e);
        }
    }

    public Banner create(@Valid BannerRequest request) {
        validateBannerRequest(request);

        try {
            Banner banner = new Banner();
            updateBannerFromRequest(banner, request);
            return bannerRepository.save(banner);
        } catch (Exception e) {
            throw new BannerException("Failed to create banner", e);
        }
    }

    public Banner update(Long id, @Valid BannerRequest request) {
        validateBannerRequest(request);
        Banner existing = findById(id);

        try {
            updateBannerFromRequest(existing, request);
            return bannerRepository.save(existing);
        } catch (Exception e) {
            throw new BannerException("Failed to update banner with id: " + id, e);
        }
    }

    public void delete(Long id) {
        Banner banner = findById(id);

        try {
            bannerRepository.delete(banner);
        } catch (Exception e) {
            throw new BannerException("Failed to delete banner with id: " + id, e);
        }
    }

    public Banner toggleActive(Long id) {
        Banner banner = findById(id);

        try {
            banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
            return bannerRepository.save(banner);
        } catch (Exception e) {
            throw new BannerException("Failed to toggle banner status with id: " + id, e);
        }
    }

    private void validateBannerRequest(BannerRequest request) {
        if (request == null) {
            throw new BannerException("Banner request cannot be null");
        }
    }

    private void updateBannerFromRequest(Banner banner, BannerRequest request) {
        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);
    }

    @Data
    public static class BannerRequest {
        @NotBlank(message = "Banner title is required")
        @Size(max = 128, message = "Banner title cannot exceed 128 characters")
        private String title;

        @NotBlank(message = "Image URL is required")
        @Size(max = 255, message = "Image URL cannot exceed 255 characters")
        private String imageUrl;

        private Boolean isActive;
    }
}
