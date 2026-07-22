package com.gplsp.controller;

import com.gplsp.dto.AuthRequest;
import com.gplsp.dto.AuthResponse;
import com.gplsp.entity.UserT;
import com.gplsp.repository.UserR;
import com.gplsp.service.UserDetailsServiceImpl;
import com.gplsp.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserR userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(),
                            authenticationRequest.getPassword()));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Incorrect username or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final UserT user = userRepository.findByUsername(authenticationRequest.getUsername()).orElse(null);
        final String role = user != null && user.getRoleT() != null ? user.getRoleT().getNom() : null;
        final String jwt = jwtUtil.generateToken(userDetails, role);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        UserT newUser = new UserT();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        userRepository.save(newUser);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getUsername());
        final String role = newUser.getRoleT() != null ? newUser.getRoleT().getNom() : null;
        final String jwt = jwtUtil.generateToken(userDetails, role);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }
}
