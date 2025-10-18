package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class AppUserController {
    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    public List<AppUser> all() {
        return appUserService.findAll();
    }

    @GetMapping("/{id}")
    public AppUser one(@PathVariable UUID id) {
        return appUserService.findById(id);
    }

    @GetMapping("/email/{email}")
    public AppUser byEmail(@PathVariable String email) {
        return appUserService.findByEmail(email);
    }

    @PostMapping
    public ResponseEntity<AppUser> create(@RequestBody AppUser user) {
        AppUser created = appUserService.create(user);
        return ResponseEntity.created(URI.create("/api/users/" + created.getUserId())).body(created);
    }

    @PutMapping("/{id}")
    public AppUser update(@PathVariable UUID id, @RequestBody AppUser user) {
        return appUserService.update(id, user);
    }

    @PatchMapping("/{id}/status")
    public AppUser updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        return appUserService.updateStatus(id, isActive);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        appUserService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
