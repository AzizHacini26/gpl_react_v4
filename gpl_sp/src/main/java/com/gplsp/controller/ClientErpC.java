package com.gplsp.controller;

import com.gplsp.entity.ClientErpT;
import com.gplsp.service.ClientErpS;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients/erp")
@CrossOrigin(origins = "*")
public class ClientErpC {

    private final ClientErpS clientErpS;

    public ClientErpC(ClientErpS clientErpS) {
        this.clientErpS = clientErpS;
    }

    @GetMapping
    public List<ClientErpT> getAll() {
        return clientErpS.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientErpT> getById(@PathVariable Integer id) {
        return clientErpS.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<ClientErpT> search(@RequestParam String q) {
        return clientErpS.search(q);
    }

    @PostMapping
    public ResponseEntity<ClientErpT> create(@RequestBody ClientErpT client) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientErpS.create(client));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientErpT> update(@PathVariable Integer id, @RequestBody ClientErpT client) {
        return clientErpS.update(id, client)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!clientErpS.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
