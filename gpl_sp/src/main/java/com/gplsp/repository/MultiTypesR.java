package com.gplsp.repository;

import com.gplsp.entity.MultyTypesT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MultiTypesR extends JpaRepository<MultyTypesT, Integer> {
    Optional<MultyTypesT> findByNom(String nom);

    Optional<MultyTypesT> findByType(String type);

    List<MultyTypesT> findAllByType(String type);
}
