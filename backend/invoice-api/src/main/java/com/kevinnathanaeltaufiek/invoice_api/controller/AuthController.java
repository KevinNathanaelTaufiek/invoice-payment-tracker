package com.kevinnathanaeltaufiek.invoice_api.controller;

import com.kevinnathanaeltaufiek.invoice_api.dto.AuthResponse;
import com.kevinnathanaeltaufiek.invoice_api.dto.LoginRequest;
import com.kevinnathanaeltaufiek.invoice_api.dto.RegisterRequest;
import com.kevinnathanaeltaufiek.invoice_api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - attempt register for email={}", request.getEmail());
        AuthResponse response = authService.register(request);
        log.info("POST /api/auth/register - register success for email={}, userId={}", request.getEmail(), response.getUser().getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - attempt login for email={}", request.getEmail());
        AuthResponse response = authService.login(request);
        log.info("POST /api/auth/login - login success for email={}", request.getEmail());
        return ResponseEntity.ok(response);
    }
}
