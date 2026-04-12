package com.kevinnathanaeltaufiek.invoice_api.service;

import com.kevinnathanaeltaufiek.invoice_api.dto.AuthResponse;
import com.kevinnathanaeltaufiek.invoice_api.dto.LoginRequest;
import com.kevinnathanaeltaufiek.invoice_api.dto.RegisterRequest;
import com.kevinnathanaeltaufiek.invoice_api.model.AppUser;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import com.kevinnathanaeltaufiek.invoice_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        log.debug("AuthService.register - checking email={}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("AuthService.register - email already registered: {}", request.getEmail());
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        log.info("AuthService.register - new user registered: id={}, email={}", user.getId(), user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        log.debug("AuthService.login - authenticating email={}", request.getEmail());
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        AppUser user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                log.warn("AuthService.login - user not found after auth passed: email={}", request.getEmail());
                return new IllegalArgumentException("User tidak ditemukan");
            });

        log.info("AuthService.login - login success: id={}, email={}", user.getId(), user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(token, user);
    }

    private AuthResponse buildResponse(String token, AppUser user) {
        return new AuthResponse(token, new AuthResponse.UserInfo(user.getId(), user.getName(), user.getEmail()));
    }
}
