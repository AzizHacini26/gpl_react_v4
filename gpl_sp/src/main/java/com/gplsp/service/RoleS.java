package com.gplsp.service;

import com.gplsp.entity.PermissionT;
import com.gplsp.entity.RoleT;
import com.gplsp.repository.PermissionR;
import com.gplsp.repository.RoleR;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoleS {

    private final RoleR roleR;
    private final PermissionR permissionR;
    private final AuditLogS auditLogS;

    public RoleS(RoleR roleR, PermissionR permissionR, AuditLogS auditLogS) {
        this.roleR = roleR;
        this.permissionR = permissionR;
        this.auditLogS = auditLogS;
    }

    public List<RoleT> getAllRoles() {
        return roleR.findAll();
    }

    public Optional<RoleT> getRoleById(Integer id) {
        return roleR.findById(id);
    }

    public RoleT createRole(RoleT role) {
        role.setPermissions(resolvePermissions(role.getPermissions()));
        RoleT saved = roleR.save(role);
        auditLogS.log("role", saved.getId(), "CREATE", null, saved,
                "Created role '" + saved.getNom() + "'");
        return saved;
    }

    public Optional<RoleT> updateRole(Integer id, RoleT roleInput) {
        return roleR.findById(id).map(existing -> {
            RoleT old = new RoleT();
            old.setId(existing.getId());
            old.setNom(existing.getNom());
            old.setPermissions(existing.getPermissions());
            existing.setNom(roleInput.getNom());
            existing.setPermissions(resolvePermissions(roleInput.getPermissions()));
            RoleT saved = roleR.save(existing);
            auditLogS.log("role", saved.getId(), "UPDATE", old, saved,
                    "Updated role '" + saved.getNom() + "'");
            return saved;
        });
    }

    public boolean deleteRole(Integer id) {
        Optional<RoleT> existing = roleR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        RoleT role = existing.get();
        roleR.deleteById(id);
        auditLogS.log("role", id, "DELETE", role, null,
                "Deleted role '" + role.getNom() + "'");
        return true;
    }

    private List<PermissionT> resolvePermissions(List<PermissionT> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new ArrayList<>();
        }
        List<Integer> ids = permissions.stream()
                .map(PermissionT::getId)
                .filter(id -> id != null)
                .toList();
        if (ids.isEmpty()) {
            return new ArrayList<>();
        }
        return permissionR.findAllById(ids);
    }
}
