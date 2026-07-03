package com.gplsp.repository;

import com.gplsp.entity.ClientT;
import com.gplsp.entity.UserT;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientR extends JpaRepository<ClientT, Integer> {
    Optional<ClientT> findByName(String name);
    boolean existsByIdcodeAndUser(String idcode, UserT user);
    boolean existsByIdcodeAndIdNotAndUser(String idcode, Integer id, UserT user);
    List<ClientT> findByUser(UserT user);
}
