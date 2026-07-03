package com.gplsp.service;

import com.gplsp.entity.RoleT;
import com.gplsp.entity.UserT;
import com.gplsp.repository.RoleR;
import com.gplsp.repository.UserR;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsersS {

    private final UserR utilisateurR;
    private final RoleR roleR;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogS auditLogS;

    public UsersS(UserR utilisateurR, RoleR roleR, PasswordEncoder passwordEncoder, AuditLogS auditLogS) {
        this.utilisateurR = utilisateurR;
        this.roleR = roleR;
        this.passwordEncoder = passwordEncoder;
        this.auditLogS = auditLogS;
    }

    public Optional<UserT> loginuser(String username, String password) {
        Optional<UserT> user = utilisateurR.findByUsername(username);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }

    public List<UserT> getAllUsers() {
        return utilisateurR.findAll();
    }

    public Optional<UserT> getUserById(Integer id) {
        return utilisateurR.findById(id);
    }

    public Optional<UserT> getUserByUsername(String username) {
        return utilisateurR.findByUsername(username);
    }

    public UserT createUser(UserT user) {
        resolveRole(user);
        encodePasswordIfNeeded(user);
        UserT saved = utilisateurR.save(user);
        auditLogS.log("user", saved.getId(), "CREATE", null, saved,
                "Created user '" + saved.getUsername() + "'");
        return saved;
    }

    public Optional<UserT> updateUser(Integer id, UserT userInput) {
        return utilisateurR.findById(id).map(existing -> {
            UserT old = copyUser(existing);
            existing.setNom(userInput.getNom());
            existing.setUsername(userInput.getUsername());
            if (userInput.getPassword() != null && !userInput.getPassword().isBlank()) {
                existing.setPassword(passwordEncoder.encode(userInput.getPassword()));
            }
            existing.setPhone(userInput.getPhone());
            existing.setActivated(userInput.isActivated());
            existing.setFirstLogin(userInput.isFirstLogin());
            existing.setRoleT(resolveRole(userInput));
            UserT saved = utilisateurR.save(existing);
            auditLogS.log("user", saved.getId(), "UPDATE", old, saved,
                    "Updated user '" + saved.getUsername() + "'");
            return saved;
        });
    }

    public boolean deleteUser(Integer id) {
        Optional<UserT> existing = utilisateurR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        UserT user = existing.get();
        utilisateurR.deleteById(id);
        auditLogS.log("user", id, "DELETE", user, null,
                "Deleted user '" + user.getUsername() + "'");
        return true;
    }

    private UserT copyUser(UserT src) {
        UserT c = new UserT();
        c.setId(src.getId());
        c.setNom(src.getNom());
        c.setUsername(src.getUsername());
        c.setPhone(src.getPhone());
        c.setActivated(src.isActivated());
        c.setFirstLogin(src.isFirstLogin());
        c.setRoleT(src.getRoleT());
        return c;
    }

    private RoleT resolveRole(UserT user) {
        if (user.getRoleT() == null || user.getRoleT().getId() == null) {
            return null;
        }
        RoleT role = roleR.findById(user.getRoleT().getId()).orElse(null);
        user.setRoleT(role);
        return role;
    }

    private void encodePasswordIfNeeded(UserT user) {
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return;
        }
        if (!user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
    }
}
