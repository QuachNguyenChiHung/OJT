package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.exception.BannerException;
import com.tanxuan.demoaws.model.Banner;
import com.tanxuan.demoaws.service.BannerService;
import com.tanxuan.demoaws.service.BannerService.BannerRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.findActiveBanners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBanner(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@Valid @RequestBody BannerRequest request) {
        Banner created = bannerService.create(request);
        return ResponseEntity.created(URI.create("/api/banners/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest request) {
        return ResponseEntity.ok(bannerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Banner> toggleBannerActive(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.toggleActive(id));
    }

    @ExceptionHandler(BannerException.class)
    public ResponseEntity<ErrorResponse> handleBannerException(BannerException e) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            e.getMessage(),
            new java.util.Date()
        );
        return ResponseEntity.badRequest().body(error);
    }

    record ErrorResponse(int status, String message, java.util.Date timestamp) {}
}
