package com.parqueadero.service;

import com.parqueadero.dto.JwtResponse;
import com.parqueadero.dto.LoginRequest;
import com.parqueadero.dto.RegistroRequest;
import com.parqueadero.exception.BusinessException;
import com.parqueadero.model.Rol;
import com.parqueadero.model.Usuario;
import com.parqueadero.repository.RolRepository;
import com.parqueadero.repository.UsuarioRepository;
import com.parqueadero.security.JwtUtils;
import com.parqueadero.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), roles);
    }

    @Transactional
    public String registrar(RegistroRequest registroRequest) {
        if (usuarioRepository.existsByUsername(registroRequest.getUsername())) {
            throw new BusinessException("Error: El username ya está en uso");
        }

        if (usuarioRepository.existsByEmail(registroRequest.getEmail())) {
            throw new BusinessException("Error: El email ya está en uso");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(registroRequest.getUsername());
        usuario.setPassword(passwordEncoder.encode(registroRequest.getPassword()));
        usuario.setNombre(registroRequest.getNombre());
        usuario.setApellido(registroRequest.getApellido());
        usuario.setEmail(registroRequest.getEmail());
        usuario.setActivo(true);

        Set<String> strRoles = registroRequest.getRoles();
        Set<Rol> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Rol userRole = rolRepository.findByNombre(Rol.RolNombre.ROLE_CLIENTE)
                    .orElseThrow(() -> new BusinessException("Error: Rol no encontrado"));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Rol adminRole = rolRepository.findByNombre(Rol.RolNombre.ROLE_ADMIN)
                                .orElseThrow(() -> new BusinessException("Error: Rol no encontrado"));
                        roles.add(adminRole);
                        break;
                    case "operador":
                        Rol operadorRole = rolRepository.findByNombre(Rol.RolNombre.ROLE_OPERADOR)
                                .orElseThrow(() -> new BusinessException("Error: Rol no encontrado"));
                        roles.add(operadorRole);
                        break;
                    default:
                        Rol clienteRole = rolRepository.findByNombre(Rol.RolNombre.ROLE_CLIENTE)
                                .orElseThrow(() -> new BusinessException("Error: Rol no encontrado"));
                        roles.add(clienteRole);
                }
            });
        }

        usuario.setRoles(roles);
        usuarioRepository.save(usuario);

        return "Usuario registrado exitosamente";
    }
}
