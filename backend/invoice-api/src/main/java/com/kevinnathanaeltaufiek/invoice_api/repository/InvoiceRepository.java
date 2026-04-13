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

    @Query("""
        SELECT DISTINCT i FROM Invoice i
        LEFT JOIN FETCH i.items
        WHERE i.user.id = :userId
        AND (:status IS NULL OR i.status = :status)
        AND (:startDate IS NULL OR i.issueDate >= :startDate)
        AND (:endDate IS NULL OR i.issueDate <= :endDate)
        """)
    List<Invoice> findByFilter(
        @Param("userId") UUID userId,
        @Param("status") String status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT i FROM Invoice i
        LEFT JOIN FETCH i.items
        WHERE i.id = :id AND i.user.id = :userId
        """)
    Optional<Invoice> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("""
        SELECT COUNT(i) FROM Invoice i
        WHERE i.user.id = :userId AND i.issueDate = :today
        """)
    long countByUserIdAndIssueDate(@Param("userId") UUID userId, @Param("today") LocalDate today);
}
