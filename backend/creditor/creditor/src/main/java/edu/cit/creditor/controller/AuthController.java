package edu.cit.creditor.controller;

import edu.cit.creditor.dto.LoginRequest;
import edu.cit.creditor.dto.SignupRequest;
import edu.cit.creditor.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return authService.getMe(userId);
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Logged out");
    }
}
