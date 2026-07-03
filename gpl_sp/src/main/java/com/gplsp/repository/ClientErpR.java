package com.gplsp.repository;

import com.gplsp.entity.ClientErpT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientErpR extends JpaRepository<ClientErpT, Integer> {
    List<ClientErpT> findByNameContainingOrPhoneContaining(String name, String phone);
}
