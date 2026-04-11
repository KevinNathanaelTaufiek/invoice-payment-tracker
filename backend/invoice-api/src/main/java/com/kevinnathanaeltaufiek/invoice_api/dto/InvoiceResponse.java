package com.kevinnathanaeltaufiek.invoice_api.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class InvoiceResponse {

    private UUID id;
    private String invoiceNumber;
    private String clientName;
    private String clientEmail;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String status;
    private String notes;
    private List<ItemResponse> items;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    public static class ItemResponse {
        private UUID id;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
