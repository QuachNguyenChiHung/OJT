package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.service.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class AppUserController {
    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    public List<AppUser> all() { return appUserService.findAll(); }

    @GetMapping("/{id}")
    public AppUser one(@PathVariable Long id) { return appUserService.findById(id); }

    @PostMapping
    public ResponseEntity<AppUser> create(@RequestBody AppUser user) {
        AppUser created = appUserService.create(user);
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(created);
    }

    @PatchMapping("/{id}/status")
    public AppUser updateStatus(@PathVariable Long id, @RequestParam AppUser.UserStatus status) {
        return appUserService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appUserService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


