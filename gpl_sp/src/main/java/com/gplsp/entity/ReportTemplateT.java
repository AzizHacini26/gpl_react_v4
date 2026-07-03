package com.gplsp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "report_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportTemplateT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 120, nullable = false)
    private String name;

    @Column(length = 120, nullable = false)
    private String reportName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TemplateSourceType sourceType = TemplateSourceType.SYSTEM;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean defaultTemplate = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "document_type_id", nullable = false)
    private DocumentTypeT documentType;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    private UserT createdBy;
}
