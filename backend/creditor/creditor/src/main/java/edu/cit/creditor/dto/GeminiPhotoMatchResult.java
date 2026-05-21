package edu.cit.creditor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiPhotoMatchResult {

    @JsonProperty("studentIdFound")
    private boolean studentIdFound;

    @JsonProperty("fullNameFound")
    private boolean fullNameFound;

    @JsonProperty("dateIssuedFound")
    private boolean dateIssuedFound;

    private boolean matches;

    private String confidence;

    private String notes;

    public boolean allFieldsFound() {
        return studentIdFound && fullNameFound && dateIssuedFound;
    }

    public String summarize() {
        return "AI photo scan — Student ID "
                + (studentIdFound ? "found" : "not found")
                + ", name "
                + (fullNameFound ? "found" : "not found")
                + ", date issued "
                + (dateIssuedFound ? "found" : "not found");
    }
}
