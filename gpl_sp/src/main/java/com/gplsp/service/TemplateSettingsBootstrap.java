package com.gplsp.service;

import com.gplsp.entity.DocumentTypeT;
import com.gplsp.entity.ReportTemplateT;
import com.gplsp.entity.TemplateSourceType;
import com.gplsp.repository.DocumentTypeR;
import com.gplsp.repository.ReportTemplateR;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TemplateSettingsBootstrap implements CommandLineRunner {

    private final DocumentTypeR documentTypeR;
    private final ReportTemplateR reportTemplateR;

    public TemplateSettingsBootstrap(DocumentTypeR documentTypeR, ReportTemplateR reportTemplateR) {
        this.documentTypeR = documentTypeR;
        this.reportTemplateR = reportTemplateR;
    }

    @Override
    @Transactional
    public void run(String... args) {
        DocumentTypeT verification = ensureDocumentType("VERIFICATION_CERT", "شهادة مراقبة");
        DocumentTypeT registration = ensureDocumentType("REGISTRATION_CARD", "بطاقة السير");
        DocumentTypeT driving = ensureDocumentType("DRIVING_CERT", "شهادة السير");

        ensureSystemTemplate(verification, "verificationReport1", "report1", true);
        ensureSystemTemplate(verification, "verificationReport2", "report2", false);
        ensureSystemTemplate(registration, "registrationReport1", "report1", true);
        ensureSystemTemplate(driving, "drivingReport1", "report1", true);
    }

    private DocumentTypeT ensureDocumentType(String code, String nameAr) {
        return documentTypeR.findByCode(code).orElseGet(() -> {
            DocumentTypeT type = new DocumentTypeT();
            type.setCode(code);
            type.setNameAr(nameAr);
            return documentTypeR.save(type);
        });
    }

    private void ensureSystemTemplate(DocumentTypeT documentType, String name, String reportName, boolean isDefault) {
        boolean exists = reportTemplateR.findByDocumentTypeAndActiveTrueOrderByIdAsc(documentType).stream()
                .anyMatch(template -> TemplateSourceType.SYSTEM == template.getSourceType()
                        && name.equals(template.getName()));
        if (exists) {
            return;
        }

        ReportTemplateT template = new ReportTemplateT();
        template.setName(name);
        template.setReportName(reportName);
        template.setSourceType(TemplateSourceType.SYSTEM);
        template.setActive(true);
        template.setDefaultTemplate(isDefault);
        template.setDocumentType(documentType);
        reportTemplateR.save(template);
    }
}
