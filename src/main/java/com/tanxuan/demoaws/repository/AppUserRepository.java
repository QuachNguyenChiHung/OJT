package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findByRole(String role);
    List<AppUser> findByIsActive(Boolean isActive);
    boolean existsByEmail(String email);
}
