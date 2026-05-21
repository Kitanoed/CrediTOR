package edu.cit.creditor.controller;

import edu.cit.creditor.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public Map<String, String> upload(
            @RequestParam String dcn,
            @RequestParam("file") MultipartFile file) {
        fileStorageService.store(dcn, file);
        return Map.of("message", "File uploaded successfully");
    }

    @GetMapping("/download/{dcn}")
    public ResponseEntity<Resource> download(@PathVariable String dcn) {
        Resource resource = fileStorageService.load(dcn);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + dcn + ".pdf\"")
                .body(resource);
    }

    @DeleteMapping("/{dcn}")
    public Map<String, String> delete(@PathVariable String dcn) {
        fileStorageService.delete(dcn);
        return Map.of("message", "File deleted");
    }
}
