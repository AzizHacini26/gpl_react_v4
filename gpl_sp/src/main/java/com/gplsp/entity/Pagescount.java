package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(name = "pagescount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pagescount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "namepage", length = 10)
    private String namepage;

    @Column(name = "number")
    private Integer number = 0;

    @Override
    public String toString() {
        return namepage;
    }

    @ManyToOne
    private ClientT clientT;

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
        final Pagescount other = (Pagescount) obj;
        return Objects.equals(this.id, other.id);
    }
}
