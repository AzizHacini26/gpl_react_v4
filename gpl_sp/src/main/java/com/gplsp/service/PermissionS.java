package com.gplsp.service;

import com.gplsp.entity.PermissionT;
import com.gplsp.repository.PermissionR;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PermissionS {

    private final PermissionR permissionR;
    private final AuditLogS auditLogS;

    public PermissionS(PermissionR permissionR, AuditLogS auditLogS) {
        this.permissionR = permissionR;
        this.auditLogS = auditLogS;
    }

    public List<PermissionT> getAllPermissions() {
        return permissionR.findAll();
    }

    @SuppressWarnings("null")
    public Optional<PermissionT> getPermissionById(Integer id) {
        return permissionR.findById(id);
    }

    @SuppressWarnings("null")
    public PermissionT createPermission(PermissionT permission) {
        PermissionT saved = permissionR.save(permission);
        auditLogS.log("permission", saved.getId(), "CREATE", null, saved,
                "Created permission '" + saved.getNom() + "'");
        return saved;
    }

    @SuppressWarnings("null")
    public Optional<PermissionT> updatePermission(Integer id, PermissionT permissionInput) {
        return permissionR.findById(id).map(existing -> {
            String oldName = existing.getNom();
            existing.setNom(permissionInput.getNom());
            PermissionT saved = permissionR.save(existing);
            auditLogS.log("permission", saved.getId(), "UPDATE", null, saved,
                    "Updated permission '" + oldName + "' → '" + saved.getNom() + "'");
            return saved;
        });
    }

    @SuppressWarnings("null")
    public boolean deletePermission(Integer id) {
        Optional<PermissionT> existing = permissionR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        PermissionT perm = existing.get();
        permissionR.deleteById(id);
        auditLogS.log("permission", id, "DELETE", perm, null,
                "Deleted permission '" + perm.getNom() + "'");
        return true;
    }
}
