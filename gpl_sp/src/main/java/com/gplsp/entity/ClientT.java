package com.gplsp.entity;

import java.sql.Date;
import java.util.Objects;
import jakarta.persistence.*;
import lombok.*;
 
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String idcode;
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
    private String battlenumb;//number
    private boolean printstate = false;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date datestart;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date dateend;
    private boolean newstate = false;
    private String moneyy;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date lastTanjime;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date lastTanjime5;
    @Temporal(jakarta.persistence.TemporalType.DATE)
    private Date firsttverify;
    private boolean active = true;
    private String obs;
    private boolean sent = false;
    private String nextVisitDate;
    private String nextRetestDate;

    private String sizeType;// cylinder rectangular

    @ManyToOne
    private UserT user;
    @ManyToOne
    private ClientErpT clientErp;

    @ManyToOne
    private MultyTypesT mcarmarqueT;//type1
    @ManyToOne
    private MultyTypesT mbatteltypeT;//type2
    @ManyToOne
    private MultyTypesT msizeT;//tpower
    @ManyToOne
    private MultyTypesT mdaysT;//tdely
    @ManyToOne
    private MultyTypesT mcartypeT;//typecar
    @ManyToOne
    private MultyTypesT mstateT;//state
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
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ClientT other = (ClientT) obj;
        if (!Objects.equals(this.id, other.id)) {
            return false;
        }
        return true;
    }

}
