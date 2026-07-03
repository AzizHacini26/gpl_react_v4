package com.gplsp.controller;

import com.gplsp.entity.UserT;
import com.gplsp.service.UsersS;
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
import org.springframework.security.core.Authentication;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UsersC {

    private final UsersS utilisateurS;

    public UsersC(UsersS utilisateurS) {
        this.utilisateurS = utilisateurS;
    }

    @GetMapping
    public List<UserT> getAllUsers() {
        return utilisateurS.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserT> getUserById(@PathVariable Integer id) {
        return utilisateurS.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return utilisateurS.getUserByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(toCurrentUserPayload(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Map<String, Object> toCurrentUserPayload(UserT user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getId());
        payload.put("nom", user.getNom());
        payload.put("username", user.getUsername());
        payload.put("phone", user.getPhone());
        payload.put("activated", user.isActivated());
        payload.put("firstLogin", user.isFirstLogin());

        if (user.getRoleT() != null) {
            Map<String, Object> rolePayload = new LinkedHashMap<>();
            rolePayload.put("id", user.getRoleT().getId());
            rolePayload.put("nom", user.getRoleT().getNom());
            payload.put("roleT", rolePayload);
        } else {
            payload.put("roleT", null);
        }

        if (user.getCompanyInfoT() != null) {
            Map<String, Object> companyPayload = new LinkedHashMap<>();
            companyPayload.put("id", user.getCompanyInfoT().getId());
            companyPayload.put("companyName", user.getCompanyInfoT().getCompanyName());
            companyPayload.put("adminName", user.getCompanyInfoT().getAdminName());
            companyPayload.put("agrement", user.getCompanyInfoT().getAgrement());
            companyPayload.put("adresse", user.getCompanyInfoT().getAdresse());
            companyPayload.put("wilaya", user.getCompanyInfoT().getWilaya());
            companyPayload.put("subwilaya", user.getCompanyInfoT().getSubwilaya());
            companyPayload.put("wilayaArabic", user.getCompanyInfoT().getWilayaArabic());
            companyPayload.put("phone1", user.getCompanyInfoT().getPhone1());
            companyPayload.put("phone2", user.getCompanyInfoT().getPhone2());
            companyPayload.put("email", user.getCompanyInfoT().getEmail());
            companyPayload.put("phonesEmail", user.getCompanyInfoT().getPhonesEmail());
            companyPayload.put("cardAgriment", user.getCompanyInfoT().getCardAgriment());
            companyPayload.put("cardAnnee", user.getCompanyInfoT().getCardAnnee());
            payload.put("companyInfoT", companyPayload);
        } else {
            payload.put("companyInfoT", null);
        }

        return payload;
    }

    @GetMapping("/login")
    public ResponseEntity<UserT> loginUser(@RequestParam String username, @RequestParam String password) {
        return utilisateurS.loginuser(username, password)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping
    public ResponseEntity<UserT> createUser(@RequestBody UserT user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurS.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserT> updateUser(@PathVariable Integer id, @RequestBody UserT user) {
        return utilisateurS.updateUser(id, user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        if (!utilisateurS.deleteUser(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

}
