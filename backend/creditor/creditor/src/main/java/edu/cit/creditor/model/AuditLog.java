package edu.cit.creditor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    private String dcn;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "registrar_id")
    private String registrarId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }
}
