package com.gplsp.entity;

import java.util.Objects;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nom", "type"})
})
public class MultyTypesT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(length = 70)
    private String nom;

    @Column(length = 50)
    private String type;

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
        final MultyTypesT other = (MultyTypesT) obj;
        if (!Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }
}