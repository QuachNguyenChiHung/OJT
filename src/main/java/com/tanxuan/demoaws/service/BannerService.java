package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Banner;
import com.tanxuan.demoaws.repository.BannerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {
    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> findAll() { return bannerRepository.findAll(); }

    public Banner findById(Long id) { return bannerRepository.findById(id).orElseThrow(); }

    public Banner create(Banner banner) { return bannerRepository.save(banner); }

    public Banner update(Long id, Banner updated) {
        Banner existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setImageUrl(updated.getImageUrl());
        existing.setIsActive(updated.getIsActive());
        return bannerRepository.save(existing);
    }

    public void delete(Long id) { bannerRepository.deleteById(id); }
}


