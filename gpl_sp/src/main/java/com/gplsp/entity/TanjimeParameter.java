package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(name = "TanjimeParameter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TanjimeParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "bottletype")
    private String bottletype;

    @Column(name = "bottlesize")
    private Integer bottlesize;

    @Column(name = "Parameters")
    private String parameters;

    @Override
    public String toString() {
        return bottletype;
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
        final TanjimeParameter other = (TanjimeParameter) obj;
        return Objects.equals(this.id, other.id);
    }
}
