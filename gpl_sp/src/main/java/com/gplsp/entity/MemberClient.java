package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(name = "MemberClient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tpower;
    private String type2;
    private String name;
    private String le;
    private String fabrication;
    private String lieu;
    private String longueur;
    private String diametre;
    private String fond;
    private String epaisseur;
    private String nature;
    private String annee;
    private String derniere;
    private String avant;
    private Integer n;
    private String pressiond;
    private String pressiondm;
    private String title;
    private String title2;
    private String immatricu;
    private String datevisit;
     private String mbnowdate;

   @ManyToOne
    private Member member;

    
    @Override
    public String toString() {
        return name;
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
        final MemberClient other = (MemberClient) obj;
        return Objects.equals(this.id, other.id);
    }
}
