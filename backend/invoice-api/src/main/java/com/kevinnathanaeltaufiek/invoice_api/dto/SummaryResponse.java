package com.kevinnathanaeltaufiek.invoice_api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class SummaryResponse {
    private long totalCount;
    private long paidCount;
    private long overdueCount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
}
