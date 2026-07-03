package com.gplsp.controller;

import com.gplsp.entity.DebtDetailsDto;
import com.gplsp.service.DebtDetailsS;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
@CrossOrigin(origins = "*")
public class DebtDetailsC {

    private final DebtDetailsS debtDetailsS;

    public DebtDetailsC(DebtDetailsS debtDetailsS) {
        this.debtDetailsS = debtDetailsS;
    }

    @GetMapping
    public List<DebtDetailsDto> getAll() {
        return debtDetailsS.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebtDetailsDto> getById(@PathVariable Integer id) {
        return debtDetailsS.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DebtDetailsDto> create(@RequestBody DebtDetailsDto debtDetailsDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(debtDetailsS.create(debtDetailsDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtDetailsDto> update(@PathVariable Integer id, @RequestBody DebtDetailsDto debtDetailsDto) {
        return debtDetailsS.update(id, debtDetailsDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!debtDetailsS.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
