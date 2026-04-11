package com.kevinnathanaeltaufiek.invoice_api.service;

import com.kevinnathanaeltaufiek.invoice_api.dto.*;
import com.kevinnathanaeltaufiek.invoice_api.model.Invoice;
import com.kevinnathanaeltaufiek.invoice_api.model.InvoiceItem;
import com.kevinnathanaeltaufiek.invoice_api.repository.InvoiceRepository;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public List<InvoiceResponse> getAll(UUID userId, String status, LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.findByFilter(userId, status, startDate, endDate)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public InvoiceResponse getById(UUID id, UUID userId) {
        var invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice tidak ditemukan"));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request, UUID userId) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        var invoice = new Invoice();
        invoice.setUser(user);
        invoice.setInvoiceNumber(generateInvoiceNumber(userId, request.getIssueDate()));
        invoice.setClientName(request.getClientName());
        invoice.setClientEmail(request.getClientEmail());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());

        for (var itemRequest : request.getItems()) {
            var item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setDescription(itemRequest.getDescription());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            invoice.getItems().add(item);
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse update(UUID id, InvoiceRequest request, UUID userId) {
        var invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice tidak ditemukan"));

        invoice.setClientName(request.getClientName());
        invoice.setClientEmail(request.getClientEmail());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());

        invoice.getItems().clear();
        for (var itemRequest : request.getItems()) {
            var item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setDescription(itemRequest.getDescription());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            invoice.getItems().add(item);
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        var invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice tidak ditemukan"));
        invoiceRepository.delete(invoice);
    }

    @Transactional
    public InvoiceResponse updateStatus(UUID id, String status, UUID userId) {
        var invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice tidak ditemukan"));
        invoice.setStatus(status);
        return toResponse(invoiceRepository.save(invoice));
    }

    public SummaryResponse getSummary(UUID userId) {
        var invoices = invoiceRepository.findByUserId(userId);

        long totalCount = invoices.size();
        long paidCount = invoices.stream().filter(i -> "PAID".equals(i.getStatus())).count();
        long overdueCount = invoices.stream().filter(i -> "OVERDUE".equals(i.getStatus())).count();

        BigDecimal totalAmount = invoices.stream()
            .flatMap(i -> i.getItems().stream())
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = invoices.stream()
            .filter(i -> "PAID".equals(i.getStatus()))
            .flatMap(i -> i.getItems().stream())
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new SummaryResponse(totalCount, paidCount, overdueCount, totalAmount, paidAmount);
    }

    private String generateInvoiceNumber(UUID userId, LocalDate issueDate) {
        String dateStr = issueDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.countByUserIdAndIssueDate(userId, issueDate);
        return String.format("INV-%s-%03d", dateStr, count + 1);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        var response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setClientName(invoice.getClientName());
        response.setClientEmail(invoice.getClientEmail());
        response.setIssueDate(invoice.getIssueDate());
        response.setDueDate(invoice.getDueDate());
        response.setStatus(invoice.getStatus());
        response.setNotes(invoice.getNotes());
        response.setCreatedAt(invoice.getCreatedAt());

        var itemResponses = invoice.getItems().stream().map(item -> {
            var ir = new InvoiceResponse.ItemResponse();
            ir.setId(item.getId());
            ir.setDescription(item.getDescription());
            ir.setQuantity(item.getQuantity());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return ir;
        }).toList();

        response.setItems(itemResponses);
        response.setTotalAmount(
            itemResponses.stream()
                .map(InvoiceResponse.ItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        return response;
    }
}
