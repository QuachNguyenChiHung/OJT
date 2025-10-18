package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.ColorDTO;
import com.tanxuan.demoaws.exception.ResourceNotFoundException;
import com.tanxuan.demoaws.model.Color;
import com.tanxuan.demoaws.repository.ColorRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ColorService {

    private final ColorRepository colorRepository;
    private final ProductDetailsRepository productDetailsRepository;

    // Get all colors
    public List<ColorDTO> getAllColors() {
        return colorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get color by ID
    public ColorDTO getColorById(UUID id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + id));
        return convertToDTO(color);
    }

    // Get color by name
    public ColorDTO getColorByName(String colorName) {
        Color color = colorRepository.findByColorName(colorName)
                .orElseThrow(() -> new ResourceNotFoundException("Color not found with name: " + colorName));
        return convertToDTO(color);
    }

    // Create color
    public ColorDTO createColor(ColorDTO colorDTO) {
        // Check if color name already exists
        if (colorRepository.existsByColorName(colorDTO.getColorName())) {
            throw new IllegalArgumentException("Color name already exists: " + colorDTO.getColorName());
        }

        // Check if color code already exists
        if (colorRepository.existsByColorCode(colorDTO.getColorCode())) {
            throw new IllegalArgumentException("Color code already exists: " + colorDTO.getColorCode());
        }

        Color color = new Color();
        color.setColorName(colorDTO.getColorName());
        color.setColorCode(colorDTO.getColorCode());

        Color savedColor = colorRepository.save(color);
        return convertToDTO(savedColor);
    }

    // Update color
    public ColorDTO updateColor(UUID id, ColorDTO colorDTO) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + id));

        // Check if new color name already exists (excluding current color)
        if (!color.getColorName().equals(colorDTO.getColorName()) &&
            colorRepository.existsByColorName(colorDTO.getColorName())) {
            throw new IllegalArgumentException("Color name already exists: " + colorDTO.getColorName());
        }

        // Check if new color code already exists (excluding current color)
        if (!color.getColorCode().equals(colorDTO.getColorCode()) &&
            colorRepository.existsByColorCode(colorDTO.getColorCode())) {
            throw new IllegalArgumentException("Color code already exists: " + colorDTO.getColorCode());
        }

        color.setColorName(colorDTO.getColorName());
        color.setColorCode(colorDTO.getColorCode());

        Color updatedColor = colorRepository.save(color);
        return convertToDTO(updatedColor);
    }

    // Delete color
    public void deleteColor(UUID id) {
        if (!colorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Color not found with id: " + id);
        }

        // Check if color is used in any product details
        Long count = productDetailsRepository.countByColorColorId(id);
        if (count > 0) {
            throw new IllegalStateException("Cannot delete color. It is used in " + count + " product details.");
        }

        colorRepository.deleteById(id);
    }

    // Convert Entity to DTO
    private ColorDTO convertToDTO(Color color) {
        ColorDTO dto = new ColorDTO();
        dto.setColorId(color.getColorId());
        dto.setColorName(color.getColorName());
        dto.setColorCode(color.getColorCode());
        return dto;
    }
}

