package com.parqueadero.controller;

import com.parqueadero.dto.EspaciosResponse;
import com.parqueadero.service.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/configuracion")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    @GetMapping("/espacios")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<EspaciosResponse> obtenerEspaciosDisponibles() {
        EspaciosResponse response = configuracionService.obtenerEspaciosDisponibles();
        return ResponseEntity.ok(response);
    }
}
