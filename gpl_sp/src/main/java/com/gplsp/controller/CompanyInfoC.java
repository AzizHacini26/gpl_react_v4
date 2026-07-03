package com.gplsp.controller;

import com.gplsp.entity.CompanyInfoT;
import com.gplsp.service.CompanyInfoS;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/company-info")
@CrossOrigin(origins = "*")
public class CompanyInfoC {

    private final CompanyInfoS companyInfoS;

    public CompanyInfoC(CompanyInfoS companyInfoS) {
        this.companyInfoS = companyInfoS;
    }

    @GetMapping
    public ResponseEntity<List<CompanyInfoT>> getAll(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(companyInfoS.getAllForUser(authentication.getName()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyInfoT> getById(@PathVariable Integer id) {
        return companyInfoS.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompanyInfoT> create(@RequestBody CompanyInfoT companyInfo, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(companyInfoS.createForUser(authentication.getName(), companyInfo, null));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyInfoT> createWithLogo(
            @RequestPart("companyInfo") CompanyInfoT companyInfo,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(companyInfoS.createForUser(authentication.getName(), companyInfo, logo));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyInfoT> update(
            @PathVariable Integer id,
            @RequestBody CompanyInfoT companyInfoInput,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return companyInfoS.updateForUser(authentication.getName(), id, companyInfoInput)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyInfoT> updateWithLogo(
            @PathVariable Integer id,
            @RequestPart("companyInfo") CompanyInfoT companyInfoInput,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return companyInfoS.updateForUser(authentication.getName(), id, companyInfoInput, logo)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable Integer id) {
        return companyInfoS.getById(id)
                .filter(companyInfo -> companyInfo.getLogo() != null && companyInfo.getLogo().length > 0)
                .map(companyInfo -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(
                                companyInfo.getLogoContentType() == null
                                        ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                                        : companyInfo.getLogoContentType()))
                        .body(companyInfo.getLogo()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!companyInfoS.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
