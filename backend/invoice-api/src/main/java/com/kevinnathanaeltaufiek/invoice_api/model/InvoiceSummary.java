package com.kevinnathanaeltaufiek.invoice_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Entity
@Immutable
@Table(name = "invoice_summaries")
public class InvoiceSummary {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "total_count")
    private long totalCount;

    @Column(name = "paid_count")
    private long paidCount;

    @Column(name = "overdue_count")
    private long overdueCount;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "paid_amount")
    private BigDecimal paidAmount;
}
