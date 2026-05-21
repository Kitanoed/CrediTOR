package edu.cit.creditor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tor_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TorRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false, columnDefinition = "varchar(50)")
    private String studentId;

    @Column(name = "full_name", nullable = false, columnDefinition = "varchar(255)")
    private String fullName;

    @Column(nullable = false, unique = true, columnDefinition = "varchar(50)")
    private String dcn;

    @Column(name = "date_issued", nullable = false)
    private LocalDate dateIssued;

    @Column(nullable = false, columnDefinition = "varchar(20)")
    private String status = "Active";

    @Column(name = "uploaded_file_name", columnDefinition = "varchar(500)")
    private String uploadedFileName;

    @Column(name = "file_size", columnDefinition = "varchar(50)")
    private String fileSize;

    @Column(name = "verification_token", nullable = false, unique = true, columnDefinition = "varchar(500)")
    private String verificationToken;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
