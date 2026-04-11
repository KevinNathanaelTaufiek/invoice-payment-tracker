package com.kevinnathanaeltaufiek.invoice_api.service;

import com.kevinnathanaeltaufiek.invoice_api.dto.AuthResponse;
import com.kevinnathanaeltaufiek.invoice_api.dto.LoginRequest;
import com.kevinnathanaeltaufiek.invoice_api.dto.RegisterRequest;
import com.kevinnathanaeltaufiek.invoice_api.model.User;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import com.kevinnathanaeltaufiek.invoice_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        var user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(token, user);
    }

    private AuthResponse buildResponse(String token, User user) {
        return new AuthResponse(token, new AuthResponse.UserInfo(user.getId(), user.getName(), user.getEmail()));
    }
}
