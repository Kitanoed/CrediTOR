package edu.cit.creditor.service;

import edu.cit.creditor.dto.AuditLogResponse;
import edu.cit.creditor.model.AuditLog;
import edu.cit.creditor.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    private static final long VERIFICATION_DEDUPE_MINUTES = 10;

    public boolean hasRecentVerificationSuccess(String dcn) {
        if (dcn == null || dcn.isBlank()) {
            return false;
        }
        Instant since = Instant.now().minus(VERIFICATION_DEDUPE_MINUTES, ChronoUnit.MINUTES);
        return auditLogRepository.existsByEventTypeAndDcnIgnoreCaseAndTimestampAfter(
                "Verification Success", dcn.trim(), since);
    }

    public void log(String eventType, String dcn, String details, String registrarId) {
        try {
            AuditLog entry = AuditLog.builder()
                    .eventType(eventType)
                    .dcn(dcn)
                    .details(details)
                    .registrarId(registrarId)
                    .timestamp(java.time.Instant.now())
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit log skipped ({}): {}", eventType, e.getMessage());
        }
    }

    public List<AuditLogResponse> list(String eventType, String dcn, int page, int limit) {
        String eventFilter = blankToNull(eventType);
        String dcnFilter = blankToNull(dcn);

        List<AuditLog> all = auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .filter(log -> eventFilter == null || eventFilter.equals(log.getEventType()))
                .filter(log -> dcnFilter == null || dcnFilter.equalsIgnoreCase(log.getDcn()))
                .toList();

        int from = Math.min((page - 1) * limit, all.size());
        int to = Math.min(from + limit, all.size());
        return all.subList(from, to).stream().map(AuditLogResponse::from).toList();
    }

    public Map<String, Long> stats() {
        return Map.of(
                "total", auditLogRepository.count(),
                "recordCreation", auditLogRepository.countByEventType("Record Creation"),
                "statusUpdate", auditLogRepository.countByEventType("Status Update"),
                "verificationSuccess", auditLogRepository.countByEventType("Verification Success"),
                "verificationFailure", auditLogRepository.countByEventType("Verification Failure"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
