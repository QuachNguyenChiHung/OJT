package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Brand;
import com.tanxuan.demoaws.repository.BrandRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(UUID id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByBrandName(brand.getBrandName())) {
            throw new RuntimeException("Brand name already exists");
        }
        return brandRepository.save(brand);
    }

    public Brand updateBrand(UUID id, Brand brandDetails) {
        Brand brand = getBrandById(id);
        brand.setBrandName(brandDetails.getBrandName());
        return brandRepository.save(brand);
    }

    public void deleteBrand(UUID id) {
        Brand brand = getBrandById(id);

        // Check if brand is used in any products
        if (!productRepository.findByBrandId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete brand that has associated products");
        }

        brandRepository.delete(brand);
    }
}
