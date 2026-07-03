package com.gplsp.controller;

import com.gplsp.dto.CreateCustomTemplateRequest;
import com.gplsp.dto.TemplateSelectionRequest;
import com.gplsp.service.TemplateSettingsS;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/template-settings")
@CrossOrigin(origins = "*")
public class TemplateSettingsC {

    private final TemplateSettingsS templateSettingsS;

    public TemplateSettingsC(TemplateSettingsS templateSettingsS) {
        this.templateSettingsS = templateSettingsS;
    }

    @GetMapping("/document-types")
    public List<Map<String, Object>> getDocumentTypes() {
        return templateSettingsS.getDocumentTypes();
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, Object>>> getTemplatesForDocumentType(
            @RequestParam String documentTypeCode,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(templateSettingsS.getAvailableTemplates(documentTypeCode, authentication.getName()));
    }

    @GetMapping("/my-selections")
    public ResponseEntity<List<Map<String, Object>>> getMySelections(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(templateSettingsS.getMySelections(authentication.getName()));
    }

    @PutMapping("/my-selections")
    public ResponseEntity<List<Map<String, Object>>> saveMySelections(
            @RequestBody List<TemplateSelectionRequest> requests,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(templateSettingsS.saveMySelections(authentication.getName(), requests));
    }

    @PostMapping("/templates")
    public ResponseEntity<Map<String, Object>> createCustomTemplate(
            @RequestBody CreateCustomTemplateRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateSettingsS.createCustomTemplate(authentication.getName(), request));
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleValidation(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
