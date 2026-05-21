package edu.cit.creditor.config;

import edu.cit.creditor.model.User;
import edu.cit.creditor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
public void run(String... args) {
    if (!userRepository.existsByEmailIgnoreCase("registrar@creditor.test")) {
        User registrar = User.builder()
                .email("registrar@creditor.test")
                .passwordHash(passwordEncoder.encode("TestPassword123!"))
                .fullName("Default Registrar")
                .role("registrar")
                .createdAt(java.time.Instant.now()) // Changed from ZonedDateTime to Instant
                .build();
        userRepository.save(registrar);
    }
}
}