package com.kevinnathanaeltaufiek.invoice_api.controller;

import com.kevinnathanaeltaufiek.invoice_api.dto.InvoiceRequest;
import com.kevinnathanaeltaufiek.invoice_api.dto.InvoiceResponse;
import com.kevinnathanaeltaufiek.invoice_api.dto.SummaryResponse;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import com.kevinnathanaeltaufiek.invoice_api.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAll(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        UUID userId = resolveUserId(userDetails);
        return ResponseEntity.ok(invoiceService.getAll(userId, status, startDate, endDate));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(invoiceService.getSummary(resolveUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(invoiceService.getById(id, resolveUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(
        @Valid @RequestBody InvoiceRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(invoiceService.create(request, resolveUserId(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody InvoiceRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(invoiceService.update(id, request, resolveUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        invoiceService.delete(id, resolveUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(
        @PathVariable UUID id,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(invoiceService.updateStatus(id, status, resolveUserId(userDetails)));
    }

    private UUID resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"))
            .getId();
    }
}
