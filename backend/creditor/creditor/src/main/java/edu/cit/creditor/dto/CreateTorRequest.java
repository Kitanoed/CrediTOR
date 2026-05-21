package edu.cit.creditor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTorRequest {
    @NotBlank
    private String studentId;
    @NotBlank
    private String fullName;
    @NotBlank
    private String dcn;
    @NotNull
    private LocalDate dateIssued;
    private String status = "Active";
}
