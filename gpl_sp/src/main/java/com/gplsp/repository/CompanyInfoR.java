package com.gplsp.repository;

import com.gplsp.entity.CompanyInfoT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyInfoR extends JpaRepository<CompanyInfoT, Integer> {
    Optional<CompanyInfoT> findByCompanyName(String companyName);

    @Query("select u.companyInfoT from UserT u where u.username = :username")
    Optional<CompanyInfoT> findOwnedByUsername(@Param("username") String username);
}
