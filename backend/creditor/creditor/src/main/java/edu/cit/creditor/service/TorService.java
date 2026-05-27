package edu.cit.creditor.service;

import edu.cit.creditor.dto.CreateTorRequest;
import edu.cit.creditor.dto.TorRecordResponse;
import edu.cit.creditor.model.TorRecord;
import edu.cit.creditor.repository.TorRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TorService {

    private final TorRecordRepository torRecordRepository;
    private final AuditService auditService;

    @Transactional
    public TorRecordResponse create(CreateTorRequest request, UUID actorId, String registrarLabel) {
        String normalizedDcn = request.getDcn().trim().toUpperCase();
        Optional<TorRecord> existingDcn = torRecordRepository.findByDcnIgnoreCase(normalizedDcn);
        if (existingDcn.isPresent()) {
            TorRecord prior = existingDcn.get();
            if ("Revoked".equalsIgnoreCase(prior.getStatus())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This DCN has been revoked and cannot be reused. Generate a new document control number.");
            }
            if (!prior.isDeleted()) {
                if (isSameRegistration(prior, request)) {
                    return TorRecordResponse.from(prior);
                }
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "DCN already exists for a different student. Generate a new DCN or use another document control number.");
            }
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "DCN already exists. Generate a new document control number.");
        }

        TorRecord record = TorRecord.builder()
                .studentId(request.getStudentId())
                .fullName(request.getFullName())
                .dcn(normalizedDcn)
                .dateIssued(request.getDateIssued())
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .verificationToken(generateVerificationToken())
                .createdBy(actorId)
                .build();

        torRecordRepository.save(record);

        auditService.log(
                "Record Creation",
                record.getDcn(),
                "New TOR record created for " + record.getFullName() + " (" + record.getStudentId() + ")",
                registrarLabel);

        return TorRecordResponse.from(record);
    }

    public long countRevoked() {
        return torRecordRepository.countByStatusIgnoreCase("Revoked");
    }

    public List<TorRecordResponse> list(String status, String search) {
        String statusFilter = blankToNull(status);
        String searchFilter = blankToNull(search);

        return torRecordRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .filter(r -> statusFilter == null || statusFilter.equals(r.getStatus()))
                .filter(r -> {
                    if (searchFilter == null) return true;
                    String q = searchFilter.toLowerCase();
                    return safeLower(r.getDcn()).contains(q)
                            || safeLower(r.getFullName()).contains(q)
                            || safeLower(r.getStudentId()).contains(q);
                })
                .map(TorRecordResponse::from)
                .toList();
    }

    public TorRecordResponse get(UUID id) {
        TorRecord record = torRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
        return TorRecordResponse.from(record);
    }

    public TorRecordResponse getByDcn(String dcn) {
        return findActiveByDcn(dcn)
                .map(TorRecordResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    @Transactional
    public TorRecordResponse updateStatus(UUID id, String newStatus, String registrarLabel) {
        TorRecord record = torRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        if ("Revoked".equalsIgnoreCase(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use POST /api/tor/{id}/revoke to revoke a document.");
        }

        String oldStatus = record.getStatus();
        record.setStatus(newStatus);
        record.setUpdatedAt(Instant.now());
        torRecordRepository.save(record);

        auditService.log(
                "Status Update",
                record.getDcn(),
                "Status of " + record.getDcn() + " changed from " + oldStatus + " to " + newStatus,
                registrarLabel);

        return TorRecordResponse.from(record);
    }

    @Transactional
    public TorRecordResponse revoke(UUID id, String registrarLabel) {
        TorRecord record = torRecordRepository.findById(id)
                .filter(r -> !r.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));

        String dcn = record.getDcn();
        record.setStatus("Revoked");
        record.setDeleted(true);
        record.setUploadedFileName(null);
        record.setFileSize(null);
        record.setUpdatedAt(Instant.now());
        torRecordRepository.save(record);

        auditService.log(
                "Status Update",
                dcn,
                "TOR revoked — removed from registry and PDF deleted (DCN: " + dcn + ")",
                registrarLabel);

        return TorRecordResponse.from(record);
    }

    public void softDelete(UUID id, String registrarLabel) {
        TorRecord record = torRecordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
        record.setDeleted(true);
        record.setUpdatedAt(Instant.now());
        torRecordRepository.save(record);
        auditService.log("Status Update", record.getDcn(), "Record soft-deleted", registrarLabel);
    }

    public void attachFile(String dcn, String fileName, String fileSize) {
        TorRecord record = findActiveByDcn(dcn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
        record.setUploadedFileName(fileName);
        record.setFileSize(fileSize);
        record.setUpdatedAt(Instant.now());
        torRecordRepository.save(record);
    }

    public java.util.Optional<TorRecord> findActiveByDcn(String dcn) {
        if (dcn == null || dcn.isBlank()) {
            return java.util.Optional.empty();
        }
        return torRecordRepository.findByDcnIgnoreCaseAndDeletedFalse(dcn.trim());
    }

    private boolean isSameRegistration(TorRecord existing, CreateTorRequest request) {
        return safeUpper(existing.getStudentId()).equals(safeUpper(request.getStudentId()))
                && safeUpper(existing.getFullName()).equals(safeUpper(request.getFullName()));
    }

    private String generateVerificationToken() {
        return "token_" + UUID.randomUUID().toString().replace("-", "");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private String safeUpper(String value) {
        return value == null ? "" : value.toUpperCase();
    }
}
