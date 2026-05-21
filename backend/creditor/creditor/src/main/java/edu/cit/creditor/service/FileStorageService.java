package edu.cit.creditor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final TorService torService;

    public FileStorageService(
            @Value("${creditor.upload.dir}") String uploadDir,
            TorService torService) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.torService = torService;
        Files.createDirectories(this.uploadDir);
    }

    public void store(String dcn, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())
                && !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        String safeDcn = dcn.toUpperCase().replaceAll("[^A-Z0-9-]", "");
        Path target = uploadDir.resolve(safeDcn + ".pdf");
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        String sizeMb = String.format("%.2f MB", file.getSize() / (1024.0 * 1024.0));
        torService.attachFile(safeDcn, file.getOriginalFilename(), sizeMb);
    }

    public Resource load(String dcn) {
        String safeDcn = dcn.toUpperCase().replaceAll("[^A-Z0-9-]", "");
        Path file = uploadDir.resolve(safeDcn + ".pdf");
        if (!Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            return resource;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file");
        }
    }

    public void delete(String dcn) {
        String safeDcn = dcn.toUpperCase().replaceAll("[^A-Z0-9-]", "");
        try {
            Files.deleteIfExists(uploadDir.resolve(safeDcn + ".pdf"));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file");
        }
    }
}
