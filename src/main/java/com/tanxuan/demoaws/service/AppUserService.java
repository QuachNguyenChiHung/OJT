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
        
        // Parse dateOfBirth from String to LocalDate
        if (userDto.getDateOfBirth() != null && !userDto.getDateOfBirth().trim().isEmpty()) {
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                user.setDateOfBirth(java.time.LocalDate.parse(userDto.getDateOfBirth(), formatter));
            } catch (java.time.format.DateTimeParseException e) {
                throw new RuntimeException("Invalid date format: please use dd/MM/yyyy format");
            }
        }
        
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
        if (updatedUser.getDateOfBirth() != null && !updatedUser.getDateOfBirth().trim().isEmpty()) {
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                java.time.LocalDate birthDate = java.time.LocalDate.parse(updatedUser.getDateOfBirth(), formatter);
                int age = java.time.Period.between(birthDate, java.time.LocalDate.now()).getYears();
                if (age < 18 || age > 100) {
                    throw new RuntimeException("Invalid age: user must be between 18 and 100 years old");
                }
                existingUser.setDateOfBirth(birthDate);
            } catch (java.time.format.DateTimeParseException e) {
                throw new RuntimeException("Invalid date format: please use dd/MM/yyyy format");
            }
        }
                
        return appUserRepository.save(existingUser);
    }

    public AppUser updateProfile(UUID id, UserDTO.UserUpdateRequest updateRequest) {
        AppUser existingUser = findById(id);

        // Validate age if dateOfBirth is provided
        if (updateRequest.getDateOfBirth() != null && !updateRequest.getDateOfBirth().trim().isEmpty()) {
            try {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                java.time.LocalDate birthDate = java.time.LocalDate.parse(updateRequest.getDateOfBirth(), formatter);
                int age = java.time.Period.between(birthDate, java.time.LocalDate.now()).getYears();
                if (age < 18 || age > 100) {
                    throw new RuntimeException("Invalid age: user must be between 18 and 100 years old");
                }
                existingUser.setDateOfBirth(birthDate);
            } catch (java.time.format.DateTimeParseException e) {
                throw new RuntimeException("Invalid date format: please use dd/MM/yyyy format");
            }
        }

        // Update name
        if (updateRequest.getFullName() != null && !updateRequest.getFullName().trim().isEmpty()) {
            existingUser.setUName(updateRequest.getFullName());
        }

        // Update phone number (can be null or empty)
        if (updateRequest.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updateRequest.getPhoneNumber().trim().isEmpty() ? null : updateRequest.getPhoneNumber());
        }

        // Update address (can be null or empty)
        if (updateRequest.getAddress() != null) {
            existingUser.setAddress(updateRequest.getAddress().trim().isEmpty() ? null : updateRequest.getAddress());
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
