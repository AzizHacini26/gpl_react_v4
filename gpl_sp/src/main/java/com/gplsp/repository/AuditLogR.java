package com.gplsp.repository;

import com.gplsp.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogR extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findByChangedByOrderByChangedAtDesc(String changedBy);
}
