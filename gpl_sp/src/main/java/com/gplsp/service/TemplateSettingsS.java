package com.gplsp.service;

import com.gplsp.dto.CreateCustomTemplateRequest;
import com.gplsp.dto.TemplateSelectionRequest;
import com.gplsp.entity.DocumentTypeT;
import com.gplsp.entity.ReportTemplateT;
import com.gplsp.entity.TemplateSourceType;
import com.gplsp.entity.UserT;
import com.gplsp.entity.UserTemplateSelectionT;
import com.gplsp.repository.DocumentTypeR;
import com.gplsp.repository.ReportTemplateR;
import com.gplsp.repository.UserR;
import com.gplsp.repository.UserTemplateSelectionR;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TemplateSettingsS {

    private final DocumentTypeR documentTypeR;
    private final ReportTemplateR reportTemplateR;
    private final UserTemplateSelectionR userTemplateSelectionR;
    private final UserR userR;

    @Value("${app.upload.dir:uploads/template-images}")
    private String uploadDir;

    public TemplateSettingsS(
            DocumentTypeR documentTypeR,
            ReportTemplateR reportTemplateR,
            UserTemplateSelectionR userTemplateSelectionR,
            UserR userR) {
        this.documentTypeR = documentTypeR;
        this.reportTemplateR = reportTemplateR;
        this.userTemplateSelectionR = userTemplateSelectionR;
        this.userR = userR;
    }

    public Resource getTemplateImage(Integer templateId) {
        ReportTemplateT template = reportTemplateR.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        if (template.getImagePath() == null || template.getImagePath().isBlank()) {
            return null;
        }
        Path filePath = Paths.get(template.getImagePath());
        if (!Files.exists(filePath)) {
            return null;
        }
        return new FileSystemResource(filePath);
    }

    @Transactional
    public void uploadTemplateImage(Integer templateId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        ReportTemplateT template = reportTemplateR.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = templateId + extension;
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            template.setImagePath(targetPath.toString());
            reportTemplateR.save(template);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> getDocumentTypes() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (DocumentTypeT type : documentTypeR.findAllByOrderByIdAsc()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", type.getId());
            row.put("code", type.getCode());
            row.put("nameAr", type.getNameAr());
            result.add(row);
        }
        return result;
    }

    public List<Map<String, Object>> getAvailableTemplates(String documentTypeCode, String username) {
        UserT user = getRequiredUser(username);
        DocumentTypeT documentType = getRequiredDocumentType(documentTypeCode);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ReportTemplateT template : reportTemplateR.findByDocumentTypeAndActiveTrueOrderByIdAsc(documentType)) {
            if (!isTemplateVisibleForUser(template, user)) {
                continue;
            }
            result.add(toTemplatePayload(template));
        }
        return result;
    }

    public List<Map<String, Object>> getMySelections(String username) {
        UserT user = getRequiredUser(username);
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserTemplateSelectionT selection : userTemplateSelectionR.findByUserTOrderByIdAsc(user)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("documentTypeCode", selection.getDocumentType().getCode());
            row.put("templateId", selection.getTemplate().getId());
            result.add(row);
        }
        return result;
    }

    @Transactional
    public List<Map<String, Object>> saveMySelections(String username, List<TemplateSelectionRequest> requests) {
        UserT user = getRequiredUser(username);

        for (TemplateSelectionRequest request : requests) {
            if (request.getDocumentTypeCode() == null || request.getDocumentTypeCode().isBlank()) {
                throw new IllegalArgumentException("documentTypeCode is required");
            }
            if (request.getTemplateId() == null) {
                throw new IllegalArgumentException("templateId is required");
            }

            DocumentTypeT documentType = getRequiredDocumentType(request.getDocumentTypeCode());
            ReportTemplateT template = reportTemplateR.findById(request.getTemplateId())
                    .orElseThrow(() -> new IllegalArgumentException("Template not found: " + request.getTemplateId()));

            if (!template.isActive()) {
                throw new IllegalArgumentException("Template is inactive: " + request.getTemplateId());
            }
            if (!documentType.getId().equals(template.getDocumentType().getId())) {
                throw new IllegalArgumentException("Template does not belong to the selected document type");
            }
            if (!isTemplateVisibleForUser(template, user)) {
                throw new IllegalArgumentException("Template is not accessible for this user");
            }

            UserTemplateSelectionT selection = userTemplateSelectionR.findByUserTAndDocumentType(user, documentType)
                    .orElseGet(UserTemplateSelectionT::new);
            selection.setUserT(user);
            selection.setDocumentType(documentType);
            selection.setTemplate(template);
            selection.setUpdatedAt(LocalDateTime.now());
            userTemplateSelectionR.save(selection);
        }

        return getMySelections(username);
    }

    @Transactional
    public Map<String, Object> createCustomTemplate(String username, CreateCustomTemplateRequest request) {
        UserT user = getRequiredUser(username);
        if (request.getDocumentTypeCode() == null || request.getDocumentTypeCode().isBlank()) {
            throw new IllegalArgumentException("documentTypeCode is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getReportName() == null || request.getReportName().isBlank()) {
            throw new IllegalArgumentException("reportName is required");
        }

        DocumentTypeT documentType = getRequiredDocumentType(request.getDocumentTypeCode());
        ReportTemplateT template = new ReportTemplateT();
        template.setName(request.getName().trim());
        template.setReportName(request.getReportName().trim());
        template.setSourceType(TemplateSourceType.CUSTOM);
        template.setActive(true);
        template.setDefaultTemplate(false);
        template.setDocumentType(documentType);
        template.setCreatedBy(user);

        ReportTemplateT saved = reportTemplateR.save(template);
        return toTemplatePayload(saved);
    }

    public String resolveReportNameForUser(String username, String documentTypeCode) {
        UserT user = getRequiredUser(username);
        DocumentTypeT documentType = getRequiredDocumentType(documentTypeCode);

        Optional<UserTemplateSelectionT> selection = userTemplateSelectionR.findByUserTAndDocumentType(user, documentType);
        if (selection.isPresent()) {
            ReportTemplateT selectedTemplate = selection.get().getTemplate();
            if (selectedTemplate.isActive() && isTemplateVisibleForUser(selectedTemplate, user)) {
                return selectedTemplate.getReportName();
            }
        }

        return reportTemplateR.findFirstByDocumentTypeAndDefaultTemplateTrueAndActiveTrueOrderByIdAsc(documentType)
                .map(ReportTemplateT::getReportName)
                .or(() -> reportTemplateR
                        .findFirstByDocumentTypeAndSourceTypeAndActiveTrueOrderByIdAsc(documentType, TemplateSourceType.SYSTEM)
                        .map(ReportTemplateT::getReportName))
                .orElseThrow(() -> new IllegalArgumentException(
                        "No active template configured for document type: " + documentTypeCode));
    }

    private boolean isTemplateVisibleForUser(ReportTemplateT template, UserT user) {
        if (template.getSourceType() == TemplateSourceType.SYSTEM) {
            return true;
        }
        return template.getCreatedBy() != null && template.getCreatedBy().getId().equals(user.getId());
    }

    private Map<String, Object> toTemplatePayload(ReportTemplateT template) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", template.getId());
        row.put("name", template.getName());
        row.put("reportName", template.getReportName());
        row.put("sourceType", template.getSourceType().name());
        row.put("documentTypeCode", template.getDocumentType().getCode());
        row.put("defaultTemplate", template.isDefaultTemplate());
        row.put("hasImage", template.getImagePath() != null && !template.getImagePath().isBlank());
        return row;
    }

    private UserT getRequiredUser(String username) {
        return userR.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private DocumentTypeT getRequiredDocumentType(String code) {
        return documentTypeR.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Document type not found: " + code));
    }
}
