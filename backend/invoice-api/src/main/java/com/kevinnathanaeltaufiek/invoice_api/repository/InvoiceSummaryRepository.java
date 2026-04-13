package com.kevinnathanaeltaufiek.invoice_api.repository;

import com.kevinnathanaeltaufiek.invoice_api.model.InvoiceSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceSummaryRepository extends JpaRepository<InvoiceSummary, UUID> {
    Optional<InvoiceSummary> findByUserId(UUID userId);
}
