package edu.cit.creditor.controller;

import edu.cit.creditor.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String dcn) {
        var logs = auditService.list(eventType, dcn, page, limit);
        return Map.of("logs", logs, "total", logs.size());
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return auditService.stats();
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportCsv() {
        var logs = auditService.list(null, null, 1, 10_000);
        StringBuilder csv = new StringBuilder("id,timestamp,eventType,dcn,details,registrarId\n");
        for (var log : logs) {
            csv.append(log.getId()).append(',')
                    .append(log.getTimestamp()).append(',')
                    .append(log.getEventType()).append(',')
                    .append(log.getDcn() != null ? log.getDcn() : "").append(',')
                    .append("\"").append(log.getDetails() != null ? log.getDetails().replace("\"", "\"\"") : "").append("\",")
                    .append(log.getRegistrarId()).append('\n');
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-logs.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }
}
