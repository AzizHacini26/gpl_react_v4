package com.gplsp.controller;

import com.gplsp.entity.AuditLog;
import com.gplsp.service.AuditLogS;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogC {

    private final AuditLogS auditLogS;

    public AuditLogC(AuditLogS auditLogS) {
        this.auditLogS = auditLogS;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getMyLogs(Authentication authentication) {
        return ResponseEntity.ok(auditLogS.getLogsForUser(authentication.getName()));
    }
}
