package com.gplsp.repository;

import com.gplsp.entity.DocumentTypeT;
import com.gplsp.entity.ReportTemplateT;
import com.gplsp.entity.TemplateSourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportTemplateR extends JpaRepository<ReportTemplateT, Integer> {
    List<ReportTemplateT> findByDocumentTypeAndActiveTrueOrderByIdAsc(DocumentTypeT documentType);

    Optional<ReportTemplateT> findFirstByDocumentTypeAndDefaultTemplateTrueAndActiveTrueOrderByIdAsc(DocumentTypeT documentType);

    Optional<ReportTemplateT> findFirstByDocumentTypeAndSourceTypeAndActiveTrueOrderByIdAsc(
            DocumentTypeT documentType,
            TemplateSourceType sourceType);
}
