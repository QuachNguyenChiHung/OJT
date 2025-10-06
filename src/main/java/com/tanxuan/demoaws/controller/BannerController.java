package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.Banner;
import com.tanxuan.demoaws.service.BannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {
    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @GetMapping
    public List<Banner> all() { return bannerService.findAll(); }

    @GetMapping("/{id}")
    public Banner one(@PathVariable Long id) { return bannerService.findById(id); }

    @PostMapping
    public ResponseEntity<Banner> create(@RequestBody Banner banner) {
        Banner created = bannerService.create(banner);
        return ResponseEntity.created(URI.create("/api/banners/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public Banner update(@PathVariable Long id, @RequestBody Banner banner) {
        return bannerService.update(id, banner);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


