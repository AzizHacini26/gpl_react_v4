package com.gplsp.repository;

import com.gplsp.entity.DebtDetailsTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DebtDetailsR extends JpaRepository<DebtDetailsTable, Integer> {
}
