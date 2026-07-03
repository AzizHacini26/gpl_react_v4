package com.gplsp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 80, unique = true, nullable = false)
    private String code;

    @Column(length = 120, nullable = false)
    private String nameAr;
}
