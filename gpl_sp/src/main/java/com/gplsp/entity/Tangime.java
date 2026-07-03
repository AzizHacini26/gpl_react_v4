package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(name = "tangime")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tangime {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "tname")
    private String tname;

    @Column(name = "tdate")
    private String tdate;

    @Column(name = "numbf")
    private String numbf;

    @Column(name = "lieusv")
    private String lieusv;

    @Column(name = "longueursv1")
    private String longueursv1;

    @Column(name = "Diamtresv1")
    private String diamtresv1;

    @Column(name = "Fondsv1")
    private String fondsv1;

    @Column(name = "Epaisseursv1")
    private String epaisseursv1;

    @Column(name = "Naturesv1")
    private String naturesv1;

    @Column(name = "tannee")
    private String tannee;

    @Column(name = "tdebut")
    private String tdebut;

    @Column(name = "tend")
    private String tend;

    @Column(name = "anssv")
    private String anssv;

    @Column(name = "pesv")
    private String pesv;

    @Column(name = "pmsv")
    private String pmsv;

    @Column(name = "page21sv1")
    private String page21sv1;

    @Column(name = "page22sv1")
    private String page22sv1;

    @Column(name = "tcarnumb")
    private String tcarnumb;

    @Column(name = "tvisite")
    private String tvisite;

    @Column(name = "counter")
    private Integer counter;

    @Column(name = "numero")
    private String numero = "";

    @Override
    public String toString() {
        return tname;
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
        final Tangime other = (Tangime) obj;
        return Objects.equals(this.id, other.id);
    }

}
