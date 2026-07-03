package com.gplsp.controller;

import com.gplsp.entity.ClientT;
import com.gplsp.service.ClientS;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientC {

    private final ClientS clientS;

    public ClientC(ClientS clientS) {
        this.clientS = clientS;
    }

    @GetMapping
    public List<ClientT> getAll() {
        return clientS.getAll();
    }

    @GetMapping("/next-idcode")
    public String getNextIdCode(@RequestParam(defaultValue = "2026") int year) {
        return clientS.getNextIdCode(year);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientT> getByID(@PathVariable Integer id) {
        return clientS.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ClientT> create(@RequestBody ClientT client) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientS.create(client));
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importClients(@RequestBody List<Map<String, Object>> clients) {
        return ResponseEntity.ok(clientS.importClients(clients));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientT> update(@PathVariable Integer id, @RequestBody ClientT clientInput) {
        return clientS.update(id, clientInput)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!clientS.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
