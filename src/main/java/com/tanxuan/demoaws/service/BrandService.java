package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Brand;
import com.tanxuan.demoaws.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {
    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByBrandName(brand.getBrandName())) {
            throw new RuntimeException("Brand name already exists");
        }
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand brandDetails) {
        Brand brand = getBrandById(id);
        brand.setBrandName(brandDetails.getBrandName());
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);
        brandRepository.delete(brand);
    }
}
