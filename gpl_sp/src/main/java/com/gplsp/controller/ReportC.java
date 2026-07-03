package com.gplsp.controller;

import com.gplsp.service.ReportS;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportC {

    private final ReportS reportS;

    public ReportC(ReportS reportS) {
        this.reportS = reportS;
    }

    @GetMapping(value = "/{reportName}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> openReport(
            @PathVariable String reportName,
            @RequestParam Map<String, String> requestParams) {
        Map<String, Object> params = new HashMap<>(requestParams);
        byte[] pdf = reportS.generatePdf(reportName, params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(reportName + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping(value = "/by-document/{documentTypeCode}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> openReportByDocumentType(
            @PathVariable String documentTypeCode,
            @RequestParam Map<String, String> requestParams,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> params = new HashMap<>(requestParams);
        byte[] pdf = reportS.generatePdfForDocumentType(authentication.getName(), documentTypeCode, params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.inline().filename(documentTypeCode + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleNotFound(IllegalArgumentException ex) {
        return ResponseEntity.status(404).contentType(MediaType.TEXT_PLAIN).body(ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleReportError(RuntimeException ex) {
        Throwable root = ex.getCause() != null ? ex.getCause() : ex;
        return ResponseEntity.status(500)
                .contentType(MediaType.TEXT_PLAIN)
                .body("Report error: " + root.getMessage());
    }
}
