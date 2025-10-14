package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.ProductDetailsDTO;
import com.tanxuan.demoaws.exception.ResourceNotFoundException;
import com.tanxuan.demoaws.model.Color;
import com.tanxuan.demoaws.model.Product;
import com.tanxuan.demoaws.model.ProductDetails;
import com.tanxuan.demoaws.repository.ColorRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import com.tanxuan.demoaws.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductDetailsService {
    
    private final ProductDetailsRepository productDetailsRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    
    // Get all product details
    public List<ProductDetailsDTO> getAllProductDetails() {
        return productDetailsRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get product details by ID
    public ProductDetailsDTO getProductDetailsById(Long id) {
        ProductDetails productDetails = productDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product details not found with id: " + id));
        return convertToDTO(productDetails);
    }
    
    // Get product details by product ID
    public List<ProductDetailsDTO> getProductDetailsByProductId(Long productId) {
        return productDetailsRepository.findByProductId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get product details by color ID
    public List<ProductDetailsDTO> getProductDetailsByColorId(Long colorId) {
        return productDetailsRepository.findByColorId(colorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Create product details
    public ProductDetailsDTO createProductDetails(ProductDetailsDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
        
        ProductDetails productDetails = new ProductDetails();
        productDetails.setProduct(product);
        
        if (dto.getColorId() != null) {
            Color color = colorRepository.findById(dto.getColorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + dto.getColorId()));
            productDetails.setColor(color);
        }
        
        productDetails.setImgList(dto.getImgList());
        productDetails.setSize(dto.getSize());
        productDetails.setAmount(dto.getAmount());
        productDetails.setPrice(dto.getPrice());
        productDetails.setStatus(dto.getStatus());
        
        ProductDetails saved = productDetailsRepository.save(productDetails);
        return convertToDTO(saved);
    }
    
    // Update product details
    public ProductDetailsDTO updateProductDetails(Long id, ProductDetailsDTO dto) {
        ProductDetails productDetails = productDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product details not found with id: " + id));
        
        if (dto.getProductId() != null && !dto.getProductId().equals(productDetails.getProduct().getId())) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
            productDetails.setProduct(product);
        }
        
        if (dto.getColorId() != null) {
            Color color = colorRepository.findById(dto.getColorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + dto.getColorId()));
            productDetails.setColor(color);
        }
        
        if (dto.getImgList() != null) {
            productDetails.setImgList(dto.getImgList());
        }
        if (dto.getSize() != null) {
            productDetails.setSize(dto.getSize());
        }
        if (dto.getAmount() != null) {
            productDetails.setAmount(dto.getAmount());
        }
        if (dto.getPrice() != null) {
            productDetails.setPrice(dto.getPrice());
        }
        if (dto.getStatus() != null) {
            productDetails.setStatus(dto.getStatus());
        }
        
        ProductDetails updated = productDetailsRepository.save(productDetails);
        return convertToDTO(updated);
    }
    
    // Delete product details
    public void deleteProductDetails(Long id) {
        if (!productDetailsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product details not found with id: " + id);
        }
        productDetailsRepository.deleteById(id);
    }
    
    // Convert Entity to DTO
    private ProductDetailsDTO convertToDTO(ProductDetails productDetails) {
        ProductDetailsDTO dto = new ProductDetailsDTO();
        dto.setId(productDetails.getId());
        dto.setProductId(productDetails.getProduct().getId());
        dto.setProductName(productDetails.getProduct().getName());
        
        if (productDetails.getColor() != null) {
            dto.setColorId(productDetails.getColor().getId());
            dto.setColorName(productDetails.getColor().getColorName());
            dto.setColorCode(productDetails.getColor().getColorCode());
        }
        
        dto.setImgList(productDetails.getImgList());
        dto.setSize(productDetails.getSize());
        dto.setAmount(productDetails.getAmount());
        dto.setPrice(productDetails.getPrice());
        dto.setStatus(productDetails.getStatus());
        
        if (productDetails.getCreatedAt() != null) {
            dto.setCreatedAt(productDetails.getCreatedAt().toString());
        }
        if (productDetails.getUpdatedAt() != null) {
            dto.setUpdatedAt(productDetails.getUpdatedAt().toString());
        }
        
        return dto;
    }
}

