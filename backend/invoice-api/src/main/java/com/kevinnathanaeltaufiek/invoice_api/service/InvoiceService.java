package com.kevinnathanaeltaufiek.invoice_api.service;

import com.kevinnathanaeltaufiek.invoice_api.dto.*;
import com.kevinnathanaeltaufiek.invoice_api.model.Invoice;
import com.kevinnathanaeltaufiek.invoice_api.model.InvoiceItem;
import com.kevinnathanaeltaufiek.invoice_api.model.InvoiceSummary;
import com.kevinnathanaeltaufiek.invoice_api.model.AppUser;
import com.kevinnathanaeltaufiek.invoice_api.repository.InvoiceRepository;
import com.kevinnathanaeltaufiek.invoice_api.repository.InvoiceSummaryRepository;
import com.kevinnathanaeltaufiek.invoice_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceSummaryRepository invoiceSummaryRepository;
    private final UserRepository userRepository;

    public List<InvoiceResponse> getAll(UUID userId, String status, LocalDate startDate, LocalDate endDate) {
        log.debug("InvoiceService.getAll - userId={}, status={}, startDate={}, endDate={}", userId, status, startDate, endDate);
        List<InvoiceResponse> result = invoiceRepository.findByFilter(userId, status, startDate, endDate)
            .stream()
            .map(this::toResponse)
            .toList();
        log.debug("InvoiceService.getAll - userId={} found {} invoice(s)", userId, result.size());
        return result;
    }

    public InvoiceResponse getById(UUID id, UUID userId) {
        log.debug("InvoiceService.getById - invoiceId={}, userId={}", id, userId);
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> {
                log.warn("InvoiceService.getById - invoice not found: id={}, userId={}", id, userId);
                return new IllegalArgumentException("Invoice tidak ditemukan");
            });
        return toResponse(invoice);
    }

    @Transactional
    @SuppressWarnings("null")
    public InvoiceResponse create(InvoiceRequest request, UUID userId) {
        log.debug("InvoiceService.create - userId={}, client={}, items={}", userId, request.getClientName(), request.getItems().size());
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("InvoiceService.create - user not found: userId={}", userId);
                return new IllegalArgumentException("User tidak ditemukan");
            });

        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setInvoiceNumber(generateInvoiceNumber(userId, request.getIssueDate()));
        BeanUtils.copyProperties(request, invoice, "items");

        for (InvoiceItemRequest itemRequest : request.getItems()) {
            if (itemRequest == null) continue;
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            BeanUtils.copyProperties(itemRequest, item);
            invoice.getItems().add(item);
        }

        InvoiceResponse response = toResponse(invoiceRepository.save(invoice));
        log.info("InvoiceService.create - invoice created: id={}, invoiceNumber={}, userId={}", response.getId(), response.getInvoiceNumber(), userId);
        return response;
    }

    @Transactional
    @SuppressWarnings("null")
    public InvoiceResponse update(UUID id, InvoiceRequest request, UUID userId) {
        log.debug("InvoiceService.update - invoiceId={}, userId={}", id, userId);
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> {
                log.warn("InvoiceService.update - invoice not found: id={}, userId={}", id, userId);
                return new IllegalArgumentException("Invoice tidak ditemukan");
            });

        BeanUtils.copyProperties(request, invoice, "items");

        invoice.getItems().clear();
        for (InvoiceItemRequest itemRequest : request.getItems()) {
            if (itemRequest == null) continue;
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            BeanUtils.copyProperties(itemRequest, item);
            invoice.getItems().add(item);
        }

        InvoiceResponse response = toResponse(invoiceRepository.save(invoice));
        log.info("InvoiceService.update - invoice updated: id={}, invoiceNumber={}, userId={}", id, response.getInvoiceNumber(), userId);
        return response;
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        log.debug("InvoiceService.delete - invoiceId={}, userId={}", id, userId);
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> {
                log.warn("InvoiceService.delete - invoice not found: id={}, userId={}", id, userId);
                return new IllegalArgumentException("Invoice tidak ditemukan");
            });
        invoiceRepository.delete(invoice);
        log.info("InvoiceService.delete - invoice deleted: id={}, invoiceNumber={}, userId={}", id, invoice.getInvoiceNumber(), userId);
    }

    @Transactional
    public InvoiceResponse updateStatus(UUID id, String status, UUID userId) {
        log.debug("InvoiceService.updateStatus - invoiceId={}, newStatus={}, userId={}", id, status, userId);
        Invoice invoice = invoiceRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> {
                log.warn("InvoiceService.updateStatus - invoice not found: id={}, userId={}", id, userId);
                return new IllegalArgumentException("Invoice tidak ditemukan");
            });
        String previousStatus = invoice.getStatus();
        invoice.setStatus(status);
        InvoiceResponse response = toResponse(invoiceRepository.save(invoice));
        log.info("InvoiceService.updateStatus - invoiceId={} status changed: {} -> {}, userId={}", id, previousStatus, status, userId);
        return response;
    }

    public SummaryResponse getSummary(UUID userId) {
        log.debug("InvoiceService.getSummary - userId={}", userId);
        InvoiceSummary summary = invoiceSummaryRepository.findByUserId(userId)
            .orElse(null);
        if (summary == null) {
            return new SummaryResponse(0L, 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO);
        }
        return new SummaryResponse(
            summary.getTotalCount(),
            summary.getPaidCount(),
            summary.getOverdueCount(),
            summary.getTotalAmount(),
            summary.getPaidAmount()
        );
    }

    private String generateInvoiceNumber(UUID userId, LocalDate issueDate) {
        String dateStr = issueDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.countByUserIdAndIssueDate(userId, issueDate);
        return String.format("INV-%s-%03d", dateStr, count + 1);
    }

    @SuppressWarnings("null")
    private InvoiceResponse toResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        BeanUtils.copyProperties(invoice, response, "items", "totalAmount", "user");

        List<InvoiceResponse.ItemResponse> itemResponses = invoice.getItems().stream().map(item -> {
            InvoiceResponse.ItemResponse ir = new InvoiceResponse.ItemResponse();
            BeanUtils.copyProperties(item, ir, "subtotal", "invoice");
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
