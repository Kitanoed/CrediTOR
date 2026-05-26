package edu.cit.creditor.controller;

import edu.cit.creditor.dto.CreateTorRequest;
import edu.cit.creditor.dto.TorRecordResponse;
import edu.cit.creditor.service.AuditActorService;
import edu.cit.creditor.service.FileStorageService;
import edu.cit.creditor.service.TorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tor")
@RequiredArgsConstructor
public class TorController {

    private final TorService torService;
    private final FileStorageService fileStorageService;
    private final AuditActorService auditActorService;

    @PostMapping
    public Map<String, TorRecordResponse> create(
            @Valid @RequestBody CreateTorRequest request,
            Authentication authentication) {
        UUID actorId = (UUID) authentication.getPrincipal();
        TorRecordResponse record =
                torService.create(request, actorId, auditActorService.registrarLabel(actorId));
        return Map.of("record", record);
    }

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        var records = torService.list(status, search);
        return Map.of("records", records, "total", records.size());
    }

    @GetMapping("/by-dcn/{dcn}")
    public Map<String, TorRecordResponse> getByDcn(@PathVariable String dcn) {
        return Map.of("record", torService.getByDcn(dcn));
    }

    @GetMapping("/{id}")
    public TorRecordResponse get(@PathVariable UUID id) {
        return torService.get(id);
    }

    @PostMapping("/{id}/revoke")
    public Map<String, String> revoke(@PathVariable UUID id, Authentication authentication) {
        UUID actorId = (UUID) authentication.getPrincipal();
        TorRecordResponse record = torService.revoke(id, auditActorService.registrarLabel(actorId));
        fileStorageService.delete(record.getDcn());
        return Map.of("message", "TOR revoked and removed");
    }

    @PutMapping("/{id}/status")
    public Map<String, TorRecordResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        UUID actorId = (UUID) authentication.getPrincipal();
        TorRecordResponse record =
                torService.updateStatus(id, body.get("status"), auditActorService.registrarLabel(actorId));
        return Map.of("record", record);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable UUID id, Authentication authentication) {
        UUID actorId = (UUID) authentication.getPrincipal();
        torService.softDelete(id, auditActorService.registrarLabel(actorId));
        return Map.of("message", "Record deleted");
    }
}
