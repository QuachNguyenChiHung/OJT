package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserService {
    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public List<AppUser> findAll() { return appUserRepository.findAll(); }

    public AppUser findById(Long id) { return appUserRepository.findById(id).orElseThrow(); }

    public AppUser create(AppUser user) { return appUserRepository.save(user); }

    public AppUser updateStatus(Long id, AppUser.UserStatus status) {
        AppUser user = findById(id);
        user.setStatus(status);
        return appUserRepository.save(user);
    }

    public void delete(Long id) { appUserRepository.deleteById(id); }
}


