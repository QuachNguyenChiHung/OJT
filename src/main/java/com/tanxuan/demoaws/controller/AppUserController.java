package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.UserDTO;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.service.AppUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class AppUserController {
    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO.UserResponse> all() {
        return appUserService.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @appUserService.isOwner(#id, authentication.name)")
    public UserDTO.UserResponse one(@PathVariable UUID id) {
        return convertToDTO(appUserService.findById(id));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDTO.UserResponse byEmail(@PathVariable String email) {
        return convertToDTO(appUserService.findByEmail(email));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponse> create(@RequestBody UserDTO.CreateUserRequest userDto) {
        AppUser created = appUserService.create(userDto);
        return ResponseEntity.created(URI.create("/api/users/" + created.getUserId()))
                .body(convertToDTO(created));
    }

    @PutMapping("/{id}")
    public UserDTO.UserResponse update(@PathVariable UUID id, @RequestBody UserDTO.CreateUserRequest user) {
        return convertToDTO(appUserService.update(id, user));
    }

    @PatchMapping("/{id}/status")
    public UserDTO.UserResponse updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        return convertToDTO(appUserService.updateStatus(id, isActive));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        appUserService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert AppUser to UserResponse DTO
    private UserDTO.UserResponse convertToDTO(AppUser user) {
        return new UserDTO.UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getDateOfBirth(),
                user.getRole(),
                user.getIsActive() != null ? user.getIsActive() : true
        );
    }
}
