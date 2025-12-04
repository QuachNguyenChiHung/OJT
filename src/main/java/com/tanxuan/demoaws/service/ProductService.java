package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.Brand;
import com.tanxuan.demoaws.model.Category;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.model.ProductDetails;
import com.tanxuan.demoaws.repository.BrandRepository;
import com.tanxuan.demoaws.repository.CategoryRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductDetailsRepository productDetailsRepository;
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository, ProductDetailsRepository productDetailsRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productDetailsRepository = productDetailsRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<Product> findAllForUser(boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findAll();
        }
        return productRepository.findByIsActive(true);
    }

    public Product findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product create(Product product, UUID categoryId, UUID brandId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        if (brandId != null) {
            Brand brand = brandRepository.findById(brandId)
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }
        return productRepository.save(product);
    }

    public Product update(UUID id, Product updated, UUID categoryId, UUID brandId) {
        Product existing = findById(id);
        // Only overwrite fields if the client provided them (non-null)
        if (updated.getPName() != null) {
            existing.setPName(updated.getPName());
        }
        if (updated.getPDesc() != null) {
            existing.setPDesc(updated.getPDesc());
        }
        if (updated.getPrice() != null) {
            existing.setPrice(updated.getPrice());
        }
        if (updated.getIsActive() != null) {
            existing.setIsActive(updated.getIsActive());
        }
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setCategory(category);
        }
        if (brandId != null) {
            Brand brand = brandRepository.findById(brandId)
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            existing.setBrand(brand);
        }
        return productRepository.save(existing);
    }

    public void delete(UUID id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    public boolean productIsInStock(UUID productId) {
        List<ProductDetails> p=this.productDetailsRepository.findByProductPId(productId);
        boolean isInStock=false;
        for(ProductDetails pd :p){
            if(pd.getInStock()){
                isInStock=true;
                break;
            }
        }
        return isInStock;
    }
    public List<Product> findByCategory(UUID categoryId) {
        return productRepository.findByCategoryCId(categoryId);
    }

    public List<Product> findByCategoryForUser(UUID categoryId, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByCategoryCId(categoryId);
        }
        return productRepository.findByCategoryCIdAndIsActive(categoryId, true);
    }

    public List<Product> findByBrand(UUID brandId) {
        return productRepository.findByBrandId(brandId);
    }

    public List<Product> findByBrandForUser(UUID brandId, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByBrandId(brandId);
        }
        return productRepository.findByBrandIdAndIsActive(brandId, true);
    }

    public List<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<Product> findByPriceRangeForUser(BigDecimal minPrice, BigDecimal maxPrice, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByPriceBetween(minPrice, maxPrice);
        }
        return productRepository.findByPriceBetweenAndIsActive(minPrice, maxPrice, true);
    }

    public List<Product> findByNameContaining(String name) {
        return productRepository.findByPNameContainingIgnoreCase(name);
    }

    public List<Product> findByNameContainingForUser(String name, boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findByPNameContainingIgnoreCase(name);
        }
        return productRepository.findByPNameContainingIgnoreCaseAndIsActive(name, true);
    }

    public String getRepresentativeImageUrl(UUID productId) {
        List<ProductDetails> productDetails = productDetailsRepository.findByProductPId(productId);
        if (productDetails != null && !productDetails.isEmpty()) {
            for (ProductDetails pd : productDetails) {
                if (pd.getImgList() != null && !pd.getImgList().trim().isEmpty()) {
                    String imgList = pd.getImgList().trim();

                    // Aggressive cleanup - remove all special characters
                    // Remove quotes (both single and double, escaped or not)
                    imgList = imgList.replace("\\\"", "");
                    imgList = imgList.replace("\"", "");
                    imgList = imgList.replace("\\'", "");
                    imgList = imgList.replace("'", "");

                    // Remove escaped forward slash
                    imgList = imgList.replace("\\/", "/");

                    // Remove brackets
                    imgList = imgList.replace("[", "");
                    imgList = imgList.replace("]", "");

                    // Replace all backslashes with forward slash
                    imgList = imgList.replace("\\", "/");

                    // Split by comma, semicolon, or pipe to get first image
                    String[] images = imgList.split("[,;|]");
                    if (images.length > 0 && !images[0].trim().isEmpty()) {
                        String cleanUrl = images[0].trim();

                        // Ensure format starts with /
                        if (!cleanUrl.startsWith("/") && !cleanUrl.startsWith("http")) {
                            cleanUrl = "/" + cleanUrl;
                        }

                        return cleanUrl;
                    }
                }
            }
        }
        return null;
    }

    public List<String> getExactlyFiveImages(String imgList) {
        List<String> images = new ArrayList<>();

        if (imgList != null && !imgList.trim().isEmpty()) {
            String cleanedImgList = imgList.trim();

            // Aggressive cleanup - remove all special characters
            // Remove quotes (both single and double, escaped or not)
            cleanedImgList = cleanedImgList.replace("\\\"", "");
            cleanedImgList = cleanedImgList.replace("\"", "");
            cleanedImgList = cleanedImgList.replace("\\'", "");
            cleanedImgList = cleanedImgList.replace("'", "");

            // Remove escaped forward slash
            cleanedImgList = cleanedImgList.replace("\\/", "/");

            // Remove brackets
            cleanedImgList = cleanedImgList.replace("[", "");
            cleanedImgList = cleanedImgList.replace("]", "");

            // Replace all backslashes with forward slash
            cleanedImgList = cleanedImgList.replace("\\", "/");

            String[] imageArray = cleanedImgList.split("[,;|]");
            for (String img : imageArray) {
                String trimmed = img.trim();
                if (!trimmed.isEmpty()) {
                    // Ensure format starts with /
                    if (!trimmed.startsWith("/") && !trimmed.startsWith("http")) {
                        trimmed = "/" + trimmed;
                    }
                    images.add(trimmed);
                }
            }
        }

        // Ensure exactly 5 images
        while (images.size() < 5) {
            images.add("https://via.placeholder.com/500x500?text=No+Image");
        }

        if (images.size() > 5) {
            images = images.subList(0, 5);
        }

        return images;
    }

    public List<Product> findBestSellingProducts(boolean isAdmin) {
        if (isAdmin) {
            return productRepository.findBestSellingProducts();
        }
        return productRepository.findBestSellingProductsByActiveStatus(true);
    }
}
