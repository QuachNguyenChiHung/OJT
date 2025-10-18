package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {
    private static final String ERROR_KEY = "error";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public record AuthRequest(
        @Email(message = "Please provide a valid email address")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Password is required")
        String password
    ) {}

    public record AuthResponse(String token, String email, String fullName) {}

    @PostMapping("/signup")
    public ResponseEntity<Object> signup(@Valid @RequestBody AuthRequest req) {
        if (appUserRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(ERROR_KEY, "Email already registered"));
        }

        try {
            AppUser user = new AppUser();
            user.setEmail(req.email());
            user.setPassword(passwordEncoder.encode(req.password()));
            user.setUName(req.email().split("@")[0]);
            user.setRole("USER");
            user.setIsActive(true);

            AppUser savedUser = appUserRepository.save(user);
            UserDetails ud = userDetailsService.loadUserByUsername(savedUser.getEmail());
            String token = jwtService.generateToken(ud);

            return ResponseEntity.ok(new AuthResponse(token, savedUser.getEmail(), savedUser.getUName()));
        } catch (Exception e) {

            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(ERROR_KEY, "Failed to create user account"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody AuthRequest req) {
        try {

            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );

            UserDetails ud = userDetailsService.loadUserByUsername(req.email());

            String token = jwtService.generateToken(ud);
            AppUser user = appUserRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getUName()));
        } catch (BadCredentialsException e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(ERROR_KEY, "Invalid email or password"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(ERROR_KEY, "Authentication failed"));
        }
    }
}
