package com.kevinnathanaeltaufiek.invoice_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class InvoiceRequest {

    @NotBlank
    private String clientName;

    private String clientEmail;

    @NotNull
    private LocalDate issueDate;

    @NotNull
    private LocalDate dueDate;

    private String notes;

    @NotEmpty
    @Valid
    private List<InvoiceItemRequest> items;
}
