package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Objects;

@Entity
@Table(name = "DebtDetailsTable")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DebtDetailsTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String prixx;
    private String prod;
    private String typewasl;
    private String dateInsert;
    private String customer;
    private String phone;
    private String amount;
    private String status;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private ClientT clientT;
    @Override
    public String toString() {
        return prod;
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
        final DebtDetailsTable other = (DebtDetailsTable) obj;
        return Objects.equals(this.id, other.id);
    }
}
