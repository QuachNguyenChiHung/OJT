package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.UserDTO;
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

    public AppUser create(UserDTO.CreateUserRequest userDto) {
        // Validate email is unique
        if (appUserRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Validate age
        if (!userDto.isValidAge()) {
            throw new RuntimeException("Invalid age: user must be between 18 and 100 years old");
        }

        // Map DTO to entity
        AppUser user = new AppUser();
        user.setEmail(userDto.getEmail());
        // Encode password
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setUName(userDto.getFullName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setAddress(userDto.getAddress());
        user.setDateOfBirth(userDto.getDateOfBirth());
        user.setRole(userDto.getRole() != null ? userDto.getRole() : "USER");
        user.setIsActive(userDto.getIsActive() != null ? userDto.getIsActive() : true);

        return appUserRepository.save(user);
    }

    public AppUser update(UUID id, UserDTO.CreateUserRequest updatedUser) {
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

        if (updatedUser.getFullName() != null) {
            existingUser.setUName(updatedUser.getFullName());
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

        if (updatedUser.getIsActive() != null) {
            existingUser.setIsActive(updatedUser.getIsActive());
        }

        // New: update dateOfBirth when provided and validate age
        if (updatedUser.getDateOfBirth() != null) {
            if (!updatedUser.isValidAge()) {
                throw new RuntimeException("Invalid age: user must be between 18 and 100 years old");
            }
            existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
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

    // Convenience method used by SpEL or controllers to check ownership
    public boolean isOwner(UUID id, String email) {
        try {
            AppUser user = findByEmail(email);
            return user.getUserId() != null && user.getUserId().equals(id);
        } catch (Exception e) {
            return false;
        }
    }
}
