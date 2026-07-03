package com.gplsp.controller;

import com.gplsp.entity.RoleT;
import com.gplsp.service.RoleS;
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
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleC {

    private final RoleS roleS;

    public RoleC(RoleS roleS) {
        this.roleS = roleS;
    }

    @GetMapping
    public List<RoleT> getAllRoles() {
        return roleS.getAllRoles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleT> getRoleById(@PathVariable Integer id) {
        return roleS.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoleT> createRole(@RequestBody RoleT role) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleS.createRole(role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleT> updateRole(@PathVariable Integer id, @RequestBody RoleT role) {
        return roleS.updateRole(id, role)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        if (!roleS.deleteRole(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
