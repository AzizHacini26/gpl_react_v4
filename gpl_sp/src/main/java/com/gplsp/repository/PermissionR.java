package com.gplsp.repository;

import com.gplsp.entity.PermissionT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionR extends JpaRepository<PermissionT, Integer> {
    Optional<PermissionT> findByNom(String nom);
}
