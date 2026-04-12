package com.kevinnathanaeltaufiek.invoice_api.repository;

import com.kevinnathanaeltaufiek.invoice_api.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByUserId(UUID userId);

    List<Invoice> findByUserIdAndStatus(UUID userId, String status);

    @Query(value = """
        SELECT * FROM invoices i
        WHERE i.user_id = :userId
        AND (:status IS NULL OR i.status = :status)
        AND (CAST(:startDate AS date) IS NULL OR i.issue_date >= CAST(:startDate AS date))
        AND (CAST(:endDate AS date) IS NULL OR i.issue_date <= CAST(:endDate AS date))
        """, nativeQuery = true)
    List<Invoice> findByFilter(
        @Param("userId") UUID userId,
        @Param("status") String status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    Optional<Invoice> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
        SELECT COUNT(i) FROM Invoice i
        WHERE i.user.id = :userId AND i.issueDate = :today
        """)
    long countByUserIdAndIssueDate(@Param("userId") UUID userId, @Param("today") LocalDate today);
}
