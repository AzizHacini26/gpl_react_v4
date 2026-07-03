package com.gplsp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(length = 100)
    private String nom;
    @Column(length = 100)
    private String username;
    @Column(length = 100)
    private String password;
    @Column(length = 20)
    private String phone;
    private boolean activated = true;
    private boolean firstLogin = true;

    @ManyToOne
    private RoleT roleT;
    @OneToOne
    @JoinColumn(name = "company_info_id", unique = true)
    private CompanyInfoT companyInfoT;
}
