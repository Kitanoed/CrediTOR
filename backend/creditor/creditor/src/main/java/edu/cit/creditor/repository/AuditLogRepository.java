package edu.cit.creditor.repository;

import edu.cit.creditor.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    long countByEventType(String eventType);

    boolean existsByEventTypeAndDcnIgnoreCaseAndTimestampAfter(
            String eventType, String dcn, Instant timestamp);
}
