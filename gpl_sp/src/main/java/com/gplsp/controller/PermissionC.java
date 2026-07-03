package com.gplsp.controller;

import com.gplsp.entity.PermissionT;
import com.gplsp.service.PermissionS;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "*")
public class PermissionC {

    private final PermissionS permissionS;

    public PermissionC(PermissionS permissionS) {
        this.permissionS = permissionS;
    }

    @GetMapping
    public List<PermissionT> getAllPermissions() {
        return permissionS.getAllPermissions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionT> getPermissionById(@PathVariable Integer id) {
        return permissionS.getPermissionById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PermissionT> createPermission(@RequestBody PermissionT permission) {
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionS.createPermission(permission));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionT> updatePermission(@PathVariable Integer id, @RequestBody PermissionT permission) {
        return permissionS.updatePermission(id, permission)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Integer id) {
        if (!permissionS.deletePermission(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
