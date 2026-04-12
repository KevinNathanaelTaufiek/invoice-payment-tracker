package com.kevinnathanaeltaufiek.invoice_api.service;

import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("UserDetailsServiceImpl.loadUserByUsername - loading user for email={}", email);
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.warn("UserDetailsServiceImpl.loadUserByUsername - user not found: email={}", email);
                return new UsernameNotFoundException("User tidak ditemukan: " + email);
            });

        log.debug("UserDetailsServiceImpl.loadUserByUsername - user loaded: email={}", email);
        return User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .roles("USER")
            .build();
    }
}
