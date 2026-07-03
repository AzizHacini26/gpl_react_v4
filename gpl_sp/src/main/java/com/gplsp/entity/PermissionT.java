package com.gplsp.entity;

import java.util.Objects;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermissionT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(length = 25, unique = true)
    private String nom;

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
        final PermissionT other = (PermissionT) obj;
        if (!Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }
}