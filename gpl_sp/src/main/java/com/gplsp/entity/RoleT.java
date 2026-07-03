package com.gplsp.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(length = 16)
    private String nom;

    @ManyToMany
    private List<PermissionT> permissions = new ArrayList<>();

    public boolean hasPermission(String permissionName) {
        if (permissions != null) {
            for (PermissionT permission : permissions) {
                if (permission.getNom().equals(permissionName)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public String toString() {
        return nom;
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final RoleT other = (RoleT) obj;
        if (!Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }

}
