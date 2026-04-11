package com.kevinnathanaeltaufiek.invoice_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class InvoiceItemRequest {

    @NotBlank
    private String description;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;
}
