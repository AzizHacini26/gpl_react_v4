package com.gplsp.service;

import com.gplsp.entity.MultyTypesT;
import com.gplsp.repository.MultiTypesR;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MultyTypesS {

    private final MultiTypesR multiTypesR;
    private final AuditLogS auditLogS;

    public MultyTypesS(MultiTypesR multiTypesR, AuditLogS auditLogS) {
        this.multiTypesR = multiTypesR;
        this.auditLogS = auditLogS;

    }

    public List<MultyTypesT> getAll() {
        return multiTypesR.findAll();
    }

    public List<MultyTypesT> findAllByType(String type) {
        return multiTypesR.findAllByType(type);
    }

    public Optional<MultyTypesT> getByID(Integer id) {
        return multiTypesR.findById(id);
    }

    public MultyTypesT create(MultyTypesT multiTypes) {
        MultyTypesT saved = multiTypesR.save(multiTypes);
        auditLogS.log("multi_type", saved.getId(), "CREATE", null, saved,
                "Created multi-type '" + saved.getNom() + "' (" + saved.getType() + ")");
        return saved;
    }

    public Optional<MultyTypesT> update(Integer id, MultyTypesT multiTypesInput) {
        return multiTypesR.findById(id).map(existing -> {
            MultyTypesT old = new MultyTypesT();
            old.setId(existing.getId());
            old.setNom(existing.getNom());
            old.setType(existing.getType());
            existing.setNom(multiTypesInput.getNom());
            existing.setType(multiTypesInput.getType());
            MultyTypesT saved = multiTypesR.save(existing);
            auditLogS.log("multi_type", saved.getId(), "UPDATE", old, saved,
                    "Updated multi-type '" + saved.getNom() + "'");
            return saved;
        });
    }

    public boolean delete(Integer id) {
        Optional<MultyTypesT> existing = multiTypesR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        MultyTypesT mt = existing.get();
        multiTypesR.deleteById(id);
        auditLogS.log("multi_type", id, "DELETE", mt, null,
                "Deleted multi-type '" + mt.getNom() + "'");
        return true;
    }

}
