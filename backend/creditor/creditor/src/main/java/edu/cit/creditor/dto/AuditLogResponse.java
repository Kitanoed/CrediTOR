package edu.cit.creditor.dto;

import edu.cit.creditor.model.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuditLogResponse {
    private String id;
    private String timestamp;
    private String eventType;
    private String dcn;
    private String details;
    private String registrarId;

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId().toString())
                .timestamp(log.getTimestamp().toString())
                .eventType(log.getEventType())
                .dcn(log.getDcn())
                .details(log.getDetails())
                .registrarId(log.getRegistrarId())
                .build();
    }
}
