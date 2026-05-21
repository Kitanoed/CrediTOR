package edu.cit.creditor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScanTextRequest {

    @NotBlank(message = "Scanned text is required")
    private String extractedText;
}
