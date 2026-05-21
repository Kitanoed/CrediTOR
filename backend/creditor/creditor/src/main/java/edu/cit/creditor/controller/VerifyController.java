package edu.cit.creditor.controller;

import edu.cit.creditor.dto.ScanTextRequest;
import edu.cit.creditor.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class VerifyController {

    private final VerificationService verificationService;

    @PostMapping("/by-token/{token}/scan")
    public Map<String, Object> byTokenWithScan(
            @PathVariable String token, @Valid @RequestBody ScanTextRequest body) {
        return verificationService.verifyByTokenWithScannedText(token, body.getExtractedText());
    }

    @PostMapping(value = "/by-token/{token}/scan-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> byTokenWithPhoto(
            @PathVariable String token, @RequestPart("photo") MultipartFile photo) {
        return verificationService.verifyByTokenWithPhoto(token, photo);
    }

    @GetMapping("/by-dcn/{dcn}")
    public Map<String, Object> lookupByDcn(@PathVariable String dcn) {
        return verificationService.lookupByDcn(dcn);
    }

    @PostMapping("/by-dcn/{dcn}/scan")
    public Map<String, Object> byDcnWithScan(
            @PathVariable String dcn, @Valid @RequestBody ScanTextRequest body) {
        return verificationService.verifyByDcnWithScannedText(dcn, body.getExtractedText());
    }
}
