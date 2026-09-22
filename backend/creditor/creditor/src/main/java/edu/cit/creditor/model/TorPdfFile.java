package edu.cit.creditor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tor_pdf_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TorPdfFile {

    @Id
    @Column(length = 50)
    private String dcn;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] content;
}
