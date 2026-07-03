package com.gplsp.entity;

import java.sql.Date;
import java.util.Objects;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clients_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientErpT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String phone;
    private String tiraz;
    private String tasalaly;
    private String number;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date tproduct;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date tverify;
    private String carnumb;
    private String battlenumb;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date lastTanjime;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date lastTanjime5;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date firsttverify;
    private String obs;
    private String sizeType;
    @ManyToOne
    private MultyTypesT mcarmarqueT;
    @ManyToOne
    private MultyTypesT mbatteltypeT;
    @ManyToOne
    private MultyTypesT msizeT;
    @ManyToOne
    private MultyTypesT mcartypeT;
    @ManyToOne
    private MultyTypesT mdomicileT;
    @ManyToOne
    private MultyTypesT mdocT;

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
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        final ClientErpT other = (ClientErpT) obj;
        return Objects.equals(this.id, other.id);
    }
}
