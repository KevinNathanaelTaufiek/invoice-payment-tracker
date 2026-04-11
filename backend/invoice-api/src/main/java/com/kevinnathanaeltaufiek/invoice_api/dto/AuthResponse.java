package com.kevinnathanaeltaufiek.invoice_api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserInfo user;

    @Getter
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String name;
        private String email;
    }
}
