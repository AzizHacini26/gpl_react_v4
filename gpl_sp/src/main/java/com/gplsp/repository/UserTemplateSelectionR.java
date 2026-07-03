package com.gplsp.repository;

import com.gplsp.entity.DocumentTypeT;
import com.gplsp.entity.UserT;
import com.gplsp.entity.UserTemplateSelectionT;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTemplateSelectionR extends JpaRepository<UserTemplateSelectionT, Integer> {
    List<UserTemplateSelectionT> findByUserTOrderByIdAsc(UserT userT);

    Optional<UserTemplateSelectionT> findByUserTAndDocumentType(UserT userT, DocumentTypeT documentType);
}
