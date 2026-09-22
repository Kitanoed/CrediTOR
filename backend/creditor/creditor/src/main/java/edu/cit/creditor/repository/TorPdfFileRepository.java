package edu.cit.creditor.repository;

import edu.cit.creditor.model.TorPdfFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TorPdfFileRepository extends JpaRepository<TorPdfFile, String> {
}
