package com.gplsp.controller;

import com.gplsp.entity.MultyTypesT;
import com.gplsp.service.MultyTypesS;
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
@RequestMapping("/api/multitypes")
@CrossOrigin(origins = "*")
public class MultiTypesC {

    private final MultyTypesS multiTypesS;

    public MultiTypesC(MultyTypesS multiTypesS) {
        this.multiTypesS = multiTypesS;
    }

    @GetMapping("/type/{type}")
    public List<MultyTypesT> getAllByType(@PathVariable String type) {
        return multiTypesS.findAllByType(type);
    }

    @GetMapping
    public List<MultyTypesT> getAll() {
        return multiTypesS.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MultyTypesT> getByID(@PathVariable Integer id) {
        return multiTypesS.getByID(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MultyTypesT> create(@RequestBody MultyTypesT multiTypes) {
        return ResponseEntity.status(HttpStatus.CREATED).body(multiTypesS.create(multiTypes));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MultyTypesT> update(@PathVariable Integer id, @RequestBody MultyTypesT multiTypesInput) {
        return multiTypesS.update(id, multiTypesInput)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!multiTypesS.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
