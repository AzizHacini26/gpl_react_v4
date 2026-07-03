package com.gplsp.repository;

import com.gplsp.entity.RoleT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleR extends JpaRepository<RoleT, Integer> {
    Optional<RoleT> findByNom(String nom);
}
