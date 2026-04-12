package com.kevinnathanaeltaufiek.invoice_api.controller;

import com.kevinnathanaeltaufiek.invoice_api.dto.InvoiceRequest;
import com.kevinnathanaeltaufiek.invoice_api.dto.InvoiceResponse;
import com.kevinnathanaeltaufiek.invoice_api.dto.SummaryResponse;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import com.kevinnathanaeltaufiek.invoice_api.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
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
        log.debug("GET /api/invoices - userId={}, status={}, startDate={}, endDate={}", userId, status, startDate, endDate);
        List<InvoiceResponse> result = invoiceService.getAll(userId, status, startDate, endDate);
        log.info("GET /api/invoices - userId={} retrieved {} invoice(s)", userId, result.size());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails);
        log.debug("GET /api/invoices/summary - userId={}", userId);
        SummaryResponse summary = invoiceService.getSummary(userId);
        log.info("GET /api/invoices/summary - userId={} total={}, paid={}, overdue={}", userId, summary.getTotalCount(), summary.getPaidCount(), summary.getOverdueCount());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = resolveUserId(userDetails);
        log.debug("GET /api/invoices/{} - userId={}", id, userId);
        InvoiceResponse response = invoiceService.getById(id, userId);
        log.info("GET /api/invoices/{} - userId={} retrieved invoiceNumber={}", id, userId, response.getInvoiceNumber());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(
        @Valid @RequestBody InvoiceRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = resolveUserId(userDetails);
        log.info("POST /api/invoices - userId={} creating invoice for client={}", userId, request.getClientName());
        InvoiceResponse response = invoiceService.create(request, userId);
        log.info("POST /api/invoices - userId={} created invoiceNumber={}, invoiceId={}", userId, response.getInvoiceNumber(), response.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody InvoiceRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = resolveUserId(userDetails);
        log.info("PUT /api/invoices/{} - userId={} updating invoice", id, userId);
        InvoiceResponse response = invoiceService.update(id, request, userId);
        log.info("PUT /api/invoices/{} - userId={} updated invoiceNumber={}", id, userId, response.getInvoiceNumber());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = resolveUserId(userDetails);
        log.info("DELETE /api/invoices/{} - userId={} deleting invoice", id, userId);
        invoiceService.delete(id, userId);
        log.info("DELETE /api/invoices/{} - userId={} invoice deleted", id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(
        @PathVariable UUID id,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = resolveUserId(userDetails);
        String status = body.get("status");
        log.info("PATCH /api/invoices/{}/status - userId={} updating status to={}", id, userId, status);
        InvoiceResponse response = invoiceService.updateStatus(id, status, userId);
        log.info("PATCH /api/invoices/{}/status - userId={} status updated to={} on invoiceNumber={}", id, userId, status, response.getInvoiceNumber());
        return ResponseEntity.ok(response);
    }

    private UUID resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"))
            .getId();
    }
}
