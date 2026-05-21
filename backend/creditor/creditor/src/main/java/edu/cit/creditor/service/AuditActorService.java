package edu.cit.creditor.service;

import edu.cit.creditor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditActorService {

    public static final String PUBLIC_VERIFIER = "Public verifier";

    private final UserRepository userRepository;

    /** Display name for registrar actions in audit logs. */
    public String registrarLabel(UUID userId) {
        if (userId == null) {
            return "Registrar";
        }
        return userRepository
                .findById(userId)
                .map(
                        user -> {
                            if (user.getFullName() != null && !user.getFullName().isBlank()) {
                                return user.getFullName().trim();
                            }
                            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                                return user.getEmail().trim();
                            }
                            return "Registrar";
                        })
                .orElse("Registrar");
    }
}
