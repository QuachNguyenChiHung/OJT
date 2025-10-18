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
import java.util.UUID;
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
    public ProductDetailsDTO getProductDetailsById(UUID id) {
        ProductDetails productDetails = productDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product details not found with id: " + id));
        return convertToDTO(productDetails);
    }

    // Get product details by product ID
    public List<ProductDetailsDTO> getProductDetailsByProductId(UUID productId) {
        return productDetailsRepository.findByProductPId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get product details by color ID
    public List<ProductDetailsDTO> getProductDetailsByColorId(UUID colorId) {
        return productDetailsRepository.findByColorColorId(colorId).stream()
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
        productDetails.setInStock(dto.getInStock() != null ? dto.getInStock() : true);

        ProductDetails saved = productDetailsRepository.save(productDetails);
        return convertToDTO(saved);
    }

    // Update product details
    public ProductDetailsDTO updateProductDetails(UUID id, ProductDetailsDTO dto) {
        ProductDetails productDetails = productDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product details not found with id: " + id));

        if (dto.getProductId() != null && !dto.getProductId().equals(productDetails.getProduct().getPId())) {
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
        if (dto.getInStock() != null) {
            productDetails.setInStock(dto.getInStock());
        }

        ProductDetails updated = productDetailsRepository.save(productDetails);
        return convertToDTO(updated);
    }

    // Delete product details
    public void deleteProductDetails(UUID id) {
        if (!productDetailsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product details not found with id: " + id);
        }
        productDetailsRepository.deleteById(id);
    }

    // Get in-stock product details
    public List<ProductDetailsDTO> getInStockProductDetails() {
        return productDetailsRepository.findByInStockTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Convert Entity to DTO
    private ProductDetailsDTO convertToDTO(ProductDetails productDetails) {
        ProductDetailsDTO dto = new ProductDetailsDTO();
        dto.setProductId(productDetails.getPdId());
        dto.setProductId(productDetails.getProduct().getPId());
        dto.setProductName(productDetails.getProduct().getPName());

        if (productDetails.getColor() != null) {
            dto.setColorId(productDetails.getColor().getColorId());
            dto.setColorName(productDetails.getColor().getColorName());
            dto.setColorCode(productDetails.getColor().getColorCode());
        }

        dto.setImgList(productDetails.getImgList());
        dto.setSize(productDetails.getSize());
        dto.setAmount(productDetails.getAmount());
        dto.setInStock(productDetails.getInStock());

        return dto;
    }
}

