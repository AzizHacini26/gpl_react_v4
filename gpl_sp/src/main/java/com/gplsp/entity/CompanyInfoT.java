package com.gplsp.entity;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInfoT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(length = 70, unique = true)
    private String companyName;
    @Column(length = 70)
    private String adminName;
    @Column(length = 70)
    private String agrement;
    @Column(length = 50)
    private String adresse;
    @Column(length = 50)
    private String phone1;
    @Column(length = 50)
    private String phone2;
      @Column(length = 50)
    private String wilaya;
      @Column(length = 50)
    private String subwilaya;
      @Column(length = 50)
    private String wilayaArabic;
    @Column(length = 50)
    private String email;
     @Column(length = 150)
    private String phonesEmail;
    @Column(length = 100)
    private String logoContentType;

    // card info 
    @Column(length = 50)
    private String cardAgriment;
     @Column(length = 50)
    private String cardAnnee;
    @Basic(fetch = FetchType.LAZY)
    @Lob
    @Column(name = "logo")
    @JsonIgnore
    private byte[] logo;

    @Override
    public String toString() {
        return companyName;
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
        final CompanyInfoT other = (CompanyInfoT) obj;
        if (!Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }
}
