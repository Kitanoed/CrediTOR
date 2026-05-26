package edu.cit.creditor.repository;

import edu.cit.creditor.model.TorRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TorRecordRepository extends JpaRepository<TorRecord, UUID> {

    List<TorRecord> findByDeletedFalseOrderByCreatedAtDesc();

    Optional<TorRecord> findByDcnIgnoreCaseAndDeletedFalse(String dcn);

    Optional<TorRecord> findByVerificationTokenAndDeletedFalse(String verificationToken);

    Optional<TorRecord> findByDcnIgnoreCase(String dcn);

    Optional<TorRecord> findByDcnIgnoreCaseAndStatus(String dcn, String status);

    Optional<TorRecord> findByVerificationTokenAndStatus(String verificationToken, String status);
}
