package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.ColorDTO;
import com.tanxuan.demoaws.service.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ColorController {
    
    private final ColorService colorService;
    
    // Get all colors
    @GetMapping
    public ResponseEntity<List<ColorDTO>> getAllColors() {
        List<ColorDTO> colors = colorService.getAllColors();
        return ResponseEntity.ok(colors);
    }
    
    // Get color by ID
    @GetMapping("/{id}")
    public ResponseEntity<ColorDTO> getColorById(@PathVariable Long id) {
        ColorDTO color = colorService.getColorById(id);
        return ResponseEntity.ok(color);
    }
    
    // Get color by name
    @GetMapping("/name/{colorName}")
    public ResponseEntity<ColorDTO> getColorByName(@PathVariable String colorName) {
        ColorDTO color = colorService.getColorByName(colorName);
        return ResponseEntity.ok(color);
    }
    
    // Create color
    @PostMapping
    public ResponseEntity<ColorDTO> createColor(@Valid @RequestBody ColorDTO colorDTO) {
        ColorDTO createdColor = colorService.createColor(colorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdColor);
    }
    
    // Update color
    @PutMapping("/{id}")
    public ResponseEntity<ColorDTO> updateColor(
            @PathVariable Long id, 
            @Valid @RequestBody ColorDTO colorDTO) {
        ColorDTO updatedColor = colorService.updateColor(id, colorDTO);
        return ResponseEntity.ok(updatedColor);
    }
    
    // Delete color
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ResponseEntity.noContent().build();
    }
}

