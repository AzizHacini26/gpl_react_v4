package com.gplsp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gplsp.entity.AuditLog;
import com.gplsp.repository.AuditLogR;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogS {

    private final AuditLogR auditLogR;
    private final ObjectMapper objectMapper;

    public AuditLogS(AuditLogR auditLogR) {
        this.auditLogR = auditLogR;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public void log(String entityType, Integer entityId, String action,
                    Object oldValue, Object newValue, String description) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            AuditLog log = new AuditLog();
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setAction(action);
            log.setChangedBy(username);
            log.setChangedAt(LocalDateTime.now());
            log.setOldValues(oldValue != null ? objectMapper.writeValueAsString(oldValue) : null);
            log.setNewValues(newValue != null ? objectMapper.writeValueAsString(newValue) : null);
            log.setDescription(description != null ? description : "");
            auditLogR.save(log);
        } catch (Exception e) {
            // silently ignore audit failures - don't break the main operation
        }
    }

    public List<AuditLog> getLogsForUser(String username) {
        return auditLogR.findByChangedByOrderByChangedAtDesc(username);
    }
}
