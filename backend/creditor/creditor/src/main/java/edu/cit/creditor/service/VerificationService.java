package edu.cit.creditor.service;

import edu.cit.creditor.dto.TorRecordResponse;
import edu.cit.creditor.model.TorRecord;
import edu.cit.creditor.repository.TorRecordRepository;
import edu.cit.creditor.util.IdMaskUtil;
import edu.cit.creditor.util.NameMaskUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final TorRecordRepository torRecordRepository;
    private final TorService torService;
    private final AuditService auditService;
    private final DocumentTextMatchService documentTextMatchService;
    private final OcrSpaceService ocrSpaceService;

    private static final String PUBLIC_VERIFIER = AuditActorService.PUBLIC_VERIFIER;

    private static final String ISSUING_OFFICE =
            "Office of the University Registrar — Main Campus";

    private static final String PHOTO_MISMATCH_MESSAGE =
            "The photo does not show the Student ID, Full Name, and Date Issued registered for this QR code or DCN. "
                    + "The document may be forged or the QR/DCN may belong to another graduate.";

    private static final String PHOTO_UNREADABLE_MESSAGE =
            "Could not read enough text from the photo. Retake the picture in good light, focused on the name, ID, and date issued.";

    private static final String REVOKED_MESSAGE =
            "This Transcript of Records has been revoked by the Office of the Registrar. "
                    + "It is no longer valid for employment, transfer, or any official purpose.";

    /** DCN lookup only — returns masked registrar details for manual comparison (no photo). */
    public Map<String, Object> lookupByDcn(String dcn) {
        Optional<TorRecord> revoked = findRevokedByDcn(dcn);
        if (revoked.isPresent()) {
            return revokedResult(revoked.get(), true);
        }

        Optional<TorRecord> optional = torService.findActiveByDcn(dcn);
        if (optional.isEmpty()) {
            auditService.log(
                    "Verification Failure",
                    dcn != null ? dcn.toUpperCase() : null,
                    "Verification failed - Invalid DCN provided",
                    PUBLIC_VERIFIER);
            return notFoundResult("No document found with DCN: " + dcn);
        }
        TorRecord record = optional.get();
        if (!auditService.hasRecentVerificationSuccess(record.getDcn())) {
            auditService.log(
                    "Verification Success",
                    record.getDcn(),
                    "DCN lookup — manual verification by employer",
                    PUBLIC_VERIFIER);
        }
        return manualLookupResult(record);
    }

    public Map<String, Object> verifyByDcnWithScannedText(String dcn, String extractedText) {
        Optional<TorRecord> revoked = findRevokedByDcn(dcn);
        if (revoked.isPresent()) {
            return revokedResult(revoked.get(), false);
        }

        Optional<TorRecord> optional = torService.findActiveByDcn(dcn);
        if (optional.isEmpty()) {
            auditService.log(
                    "Verification Failure",
                    dcn != null ? dcn.toUpperCase() : null,
                    "Verification failed - Invalid DCN provided",
                    PUBLIC_VERIFIER);
            return notFoundResult("No document found with DCN: " + dcn);
        }
        return verifyRecordWithScannedText(optional.get(), extractedText, "Document verified via DCN and photo scan");
    }

    public Map<String, Object> verifyByTokenWithScannedText(String token, String extractedText) {
        Optional<TorRecord> revoked = findRevokedByToken(token);
        if (revoked.isPresent()) {
            return revokedResult(revoked.get(), false);
        }

        Optional<TorRecord> optional = torRecordRepository.findByVerificationTokenAndDeletedFalse(token);
        if (optional.isEmpty()) {
            auditService.log(
                    "Verification Failure",
                    null,
                    "Verification failed - Invalid verification token",
                    PUBLIC_VERIFIER);
            return notFoundResult("Invalid verification token");
        }
        return verifyRecordWithScannedText(
                optional.get(), extractedText, "Document verified via QR token and photo scan");
    }

    /** QR verification: send TOR photo; OCR.space extracts text and matches registrar record. */
    public Map<String, Object> verifyByTokenWithPhoto(String token, MultipartFile photo) {
        Optional<TorRecord> revoked = findRevokedByToken(token);
        if (revoked.isPresent()) {
            return revokedResult(revoked.get(), false);
        }

        Optional<TorRecord> optional = torRecordRepository.findByVerificationTokenAndDeletedFalse(token);
        if (optional.isEmpty()) {
            auditService.log(
                    "Verification Failure",
                    null,
                    "Verification failed - Invalid verification token",
                    PUBLIC_VERIFIER);
            return notFoundResult("Invalid verification token");
        }
        TorRecord record = optional.get();

        if (!ocrSpaceService.isConfigured()) {
            return scanConfigErrorResult();
        }

        try {
            String extractedText = ocrSpaceService.extractTextFromPhoto(photo);
            return verifyRecordWithScannedText(
                    record, extractedText, "Document verified via QR token and OCR photo scan");
        } catch (IllegalArgumentException | IllegalStateException e) {
            auditService.log(
                    "Verification Failure",
                    record.getDcn(),
                    "Photo scan failed - " + e.getMessage(),
                    PUBLIC_VERIFIER);
            Map<String, Object> result = photoUnreadableResult();
            if (e.getMessage() != null && !e.getMessage().isBlank()) {
                result.put("error", e.getMessage());
                result.put("statusMessage", e.getMessage());
            }
            return result;
        } catch (Exception e) {
            auditService.log(
                    "Verification Failure",
                    record.getDcn(),
                    "OCR photo scan error - " + e.getMessage(),
                    PUBLIC_VERIFIER);
            Map<String, Object> result = photoUnreadableResult();
            result.put(
                    "error",
                    "Could not read the photo. Try a clearer image, or ask the registrar to check the OCR.space API key.");
            result.put("statusMessage", result.get("error"));
            return result;
        }
    }

    private Map<String, Object> scanConfigErrorResult() {
        String msg =
                "Photo verification is not configured on the server. Set OCR_SPACE_API_KEY or add "
                        + "creditor.ocrspace.api-key in application-secrets.properties, then restart the backend.";
        Map<String, Object> result = new HashMap<>();
        result.put("found", true);
        result.put("verified", false);
        result.put("identityMatch", false);
        result.put("overallStatus", "Scan Unavailable");
        result.put("statusMessage", msg);
        result.put("error", msg);
        result.put("matchSummary", msg);
        return result;
    }

    private Map<String, Object> verifyRecordWithScannedText(
            TorRecord record, String extractedText, String successMessage) {
        if (extractedText == null || extractedText.isBlank()) {
            auditService.log(
                    "Verification Failure",
                    record.getDcn(),
                    "Photo scan failed - no extractable text",
                    PUBLIC_VERIFIER);
            return photoUnreadableResult();
        }
        if (!documentTextMatchService.matchesRecord(extractedText, record)) {
            String details = documentTextMatchService.summarizeFindings(extractedText, record);
            auditService.log(
                    "Verification Failure",
                    record.getDcn(),
                    "Photo identity scan mismatch - " + details,
                    PUBLIC_VERIFIER);
            return identityMismatchResult(details, record);
        }
        return successResult(
                record,
                successMessage + " (" + documentTextMatchService.summarizeFindings(extractedText, record) + ")");
    }

    private Optional<TorRecord> findRevokedByDcn(String dcn) {
        if (dcn == null || dcn.isBlank()) {
            return Optional.empty();
        }
        return torRecordRepository.findByDcnIgnoreCaseAndStatus(dcn.trim(), "Revoked");
    }

    private Optional<TorRecord> findRevokedByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return torRecordRepository.findByVerificationTokenAndStatus(token.trim(), "Revoked");
    }

    private Map<String, Object> revokedResult(TorRecord record, boolean manualVerification) {
        auditService.log(
                "Verification Failure",
                record.getDcn(),
                "Verification blocked — TOR revoked (DCN: " + record.getDcn() + ")",
                PUBLIC_VERIFIER);

        Map<String, Object> result = baseRecordResult(record, false);
        result.put("revoked", true);
        result.put("manualVerification", manualVerification);
        result.put("overallStatus", "Revoked");
        result.put("statusMessage", REVOKED_MESSAGE);
        result.put(
                "matchSummary",
                manualVerification
                        ? "This DCN is on file but the registrar has revoked this transcript."
                        : "This QR code is on file but the registrar has revoked this transcript.");
        return result;
    }

    private Map<String, Object> notFoundResult(String error) {
        return Map.of(
                "found", false,
                "verified", false,
                "identityMatch", false,
                "error", error);
    }

    private Map<String, Object> photoUnreadableResult() {
        Map<String, Object> result = new HashMap<>();
        result.put("found", true);
        result.put("verified", false);
        result.put("identityMatch", false);
        result.put("overallStatus", "Scan Failed");
        result.put("statusMessage", PHOTO_UNREADABLE_MESSAGE);
        result.put("error", PHOTO_UNREADABLE_MESSAGE);
        result.put("matchSummary", PHOTO_UNREADABLE_MESSAGE);
        return result;
    }

    private Map<String, Object> identityMismatchResult(String scanDetails, TorRecord record) {
        Map<String, Object> result = new HashMap<>();
        result.put("found", true);
        result.put("verified", false);
        result.put("identityMatch", false);
        result.put("overallStatus", "Identity Mismatch");
        result.put("matchSummary", scanDetails);

        String statusMessage = buildMismatchMessage(scanDetails, record);
        result.put("statusMessage", statusMessage);
        result.put("error", statusMessage);
        return result;
    }

    private String buildMismatchMessage(String scanDetails, TorRecord record) {
        if (scanDetails == null) {
            return PHOTO_MISMATCH_MESSAGE;
        }
        boolean idOk = scanDetails.contains("Student ID found");
        boolean nameOk = scanDetails.contains("name found");
        boolean dateMissing = scanDetails.contains("date issued not found");

        if (idOk && nameOk && dateMissing && record.getDateIssued() != null) {
            return "Name and Student ID match, but the photo does not show the Date Issued ("
                    + record.getDateIssued().format(java.time.format.DateTimeFormatter.ofPattern("M/d/yyyy"))
                    + "). Retake the photo so it includes the date issued on the TOR — not only admission date or enrollment info.";
        }
        return PHOTO_MISMATCH_MESSAGE + " " + scanDetails;
    }

    private Map<String, Object> manualLookupResult(TorRecord record) {
        boolean active = "Active".equalsIgnoreCase(record.getStatus());
        Map<String, Object> result = baseRecordResult(record, active);
        result.put("manualVerification", true);
        result.put("message", "DCN lookup — manual verification");
        result.put(
                "statusMessage",
                active
                        ? "Registrar record found. Compare the masked details below with the physical TOR."
                        : statusMessage(record.getStatus()));
        result.put(
                "matchSummary",
                "Manually check that the paper document matches the Student ID, name, and date issued shown below.");
        return result;
    }

    private Map<String, Object> successResult(TorRecord record, String message) {
        if (!auditService.hasRecentVerificationSuccess(record.getDcn())) {
            auditService.log("Verification Success", record.getDcn(), message, PUBLIC_VERIFIER);
        }
        boolean active = "Active".equalsIgnoreCase(record.getStatus());
        Map<String, Object> result = baseRecordResult(record, active);
        result.put("manualVerification", false);
        result.put("message", message);
        result.put("statusMessage", statusMessage(record.getStatus()));
        result.put(
                "matchSummary",
                active
                        ? "OCR photo scan matched Student ID, Full Name, and Date Issued on the registrar record."
                        : "Photo identity matches the registrar record, but document status is "
                                + record.getStatus() + ".");
        return result;
    }

    private Map<String, Object> baseRecordResult(TorRecord record, boolean active) {
        Map<String, Object> result = new HashMap<>();
        result.put("found", true);
        result.put("verified", active);
        result.put("identityMatch", true);
        result.put("status", record.getStatus());
        result.put("overallStatus", active ? "Verified" : record.getStatus());
        result.put("record", TorRecordResponse.from(record));
        result.put("maskedName", NameMaskUtil.maskName(record.getFullName()));
        result.put("maskedStudentId", IdMaskUtil.maskStudentId(record.getStudentId()));
        result.put("issuingOffice", ISSUING_OFFICE);
        return result;
    }

    private String statusMessage(String status) {
        if ("Active".equalsIgnoreCase(status)) {
            return "This document matches an active registrar record.";
        }
        if ("Revoked".equalsIgnoreCase(status)) {
            return "This document was found but has been revoked by the registrar.";
        }
        if ("Expired".equalsIgnoreCase(status)) {
            return "This document was found but is no longer active (expired).";
        }
        return "This document was found in the registrar system.";
    }
}
