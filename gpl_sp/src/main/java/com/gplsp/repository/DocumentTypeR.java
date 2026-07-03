package com.gplsp.repository;

import com.gplsp.entity.DocumentTypeT;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentTypeR extends JpaRepository<DocumentTypeT, Integer> {
    Optional<DocumentTypeT> findByCode(String code);

    List<DocumentTypeT> findAllByOrderByIdAsc();
}
