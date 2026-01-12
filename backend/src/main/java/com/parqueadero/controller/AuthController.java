package com.parqueadero.controller;

import com.parqueadero.dto.JwtResponse;
import com.parqueadero.dto.LoginRequest;
import com.parqueadero.dto.RegistroRequest;
import com.parqueadero.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registro(@Valid @RequestBody RegistroRequest registroRequest) {
        String mensaje = authService.registrar(registroRequest);
        return ResponseEntity.ok(mensaje);
    }
}
