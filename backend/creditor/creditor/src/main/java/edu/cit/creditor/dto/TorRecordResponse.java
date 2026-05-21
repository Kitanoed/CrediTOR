package edu.cit.creditor.dto;

import edu.cit.creditor.model.TorRecord;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class TorRecordResponse {
    private String id;
    private String studentId;
    private String fullName;
    private String dcn;
    private LocalDate dateIssued;
    private String uploadedFileName;
    private String status;
    private String verificationToken;
    private String fileSize;
    private String createdAt;

    public static TorRecordResponse from(TorRecord record) {
        return TorRecordResponse.builder()
                .id(record.getId().toString())
                .studentId(record.getStudentId())
                .fullName(record.getFullName())
                .dcn(record.getDcn())
                .dateIssued(record.getDateIssued())
                .uploadedFileName(record.getUploadedFileName())
                .status(record.getStatus())
                .verificationToken(record.getVerificationToken())
                .fileSize(record.getFileSize())
                .createdAt(record.getCreatedAt().toString())
                .build();
    }
}
