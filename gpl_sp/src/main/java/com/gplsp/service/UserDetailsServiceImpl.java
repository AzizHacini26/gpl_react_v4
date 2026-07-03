package com.gplsp.service;

import com.gplsp.entity.UserT;
import com.gplsp.repository.UserR;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserR userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserT user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRoleT() != null && user.getRoleT().getPermissions() != null) {
            user.getRoleT().getPermissions().stream()
                    .map(permission -> permission.getNom())
                    .filter(permissionName -> permissionName != null && !permissionName.isBlank())
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities);
    }
}
