package edu.cit.creditor.service;

import edu.cit.creditor.model.TorPdfFile;
import edu.cit.creditor.repository.TorPdfFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final TorService torService;
    private final TorPdfFileRepository torPdfFileRepository;

    public FileStorageService(
            @Value("${creditor.upload.dir}") String uploadDir,
            TorService torService,
            TorPdfFileRepository torPdfFileRepository) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.torService = torService;
        this.torPdfFileRepository = torPdfFileRepository;
        Files.createDirectories(this.uploadDir);
    }

    public void store(String dcn, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())
                && !originalName.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        String safeDcn = sanitizeDcn(dcn);
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        Path target = uploadDir.resolve(safeDcn + ".pdf");
        try {
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        TorPdfFile pdf = torPdfFileRepository.findById(safeDcn)
                .orElseGet(() -> TorPdfFile.builder().dcn(safeDcn).build());
        pdf.setContent(bytes);
        torPdfFileRepository.save(pdf);

        String sizeMb = String.format("%.2f MB", bytes.length / (1024.0 * 1024.0));
        torService.attachFile(safeDcn, originalName.isBlank() ? safeDcn + ".pdf" : originalName, sizeMb);
    }

    public Resource load(String dcn) {
        String safeDcn = sanitizeDcn(dcn);
        Path file = uploadDir.resolve(safeDcn + ".pdf");
        if (Files.isRegularFile(file)) {
            return new FileSystemResource(file);
        }

        return torPdfFileRepository.findById(safeDcn)
                .map(stored -> {
                    try {
                        Files.write(file, stored.getContent());
                    } catch (IOException ignored) {
                        /* disk cache is optional */
                    }
                    return (Resource) new ByteArrayResource(stored.getContent());
                })
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No PDF is stored for this TOR. Open Issue New TOR and register it again to save the file."));
    }

    public void delete(String dcn) {
        String safeDcn = sanitizeDcn(dcn);
        try {
            Files.deleteIfExists(uploadDir.resolve(safeDcn + ".pdf"));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file");
        }
        torPdfFileRepository.deleteById(safeDcn);
    }

    private static String sanitizeDcn(String dcn) {
        return dcn == null ? "" : dcn.toUpperCase().replaceAll("[^A-Z0-9-]", "");
    }
}
