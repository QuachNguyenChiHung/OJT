package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.repository.AppUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppUserService {
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AppUser> findAll() {
        return appUserRepository.findAll();
    }

    public AppUser findById(UUID id) {
        return appUserRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AppUser create(AppUser user) {
        // Validate email is unique
        if (appUserRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default values
        user.setIsActive(true);
        if (user.getRole() == null) {
            user.setRole("USER");
        }

        return appUserRepository.save(user);
    }

    public AppUser update(UUID id, AppUser updatedUser) {
        AppUser existingUser = findById(id);

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            if (appUserRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getUName() != null) {
            existingUser.setUName(updatedUser.getUName());
        }

        if (updatedUser.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        }

        if (updatedUser.getAddress() != null) {
            existingUser.setAddress(updatedUser.getAddress());
        }

        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }

        return appUserRepository.save(existingUser);
    }

    public AppUser updateStatus(UUID id, boolean isActive) {
        AppUser user = findById(id);
        user.setIsActive(isActive);
        return appUserRepository.save(user);
    }

    public void delete(UUID id) {
        findById(id); // Check if exists
        appUserRepository.deleteById(id);
    }

    public AppUser findByEmail(String email) {
        return appUserRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
