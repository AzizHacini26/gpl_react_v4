package com.gplsp.repository;

import com.gplsp.entity.UserT;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserR extends JpaRepository<UserT, Integer> {
    @EntityGraph(attributePaths = { "roleT", "roleT.permissions" })
    Optional<UserT> findByUsername(String username);
}
