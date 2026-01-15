package com.parqueadero.backend.controller;

import com.parqueadero.backend.dto.AlertaDTO;
import com.parqueadero.backend.service.AlertasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertasController {

    private final AlertasService alertasService;

    /**
     * GET /api/alertas/espacios-criticos
     * Obtiene lista de alertas de espacios críticos
     */
    @GetMapping("/espacios-criticos")
    public ResponseEntity<List<AlertaDTO>> obtenerEspaciosCriticos() {
        return ResponseEntity.ok(alertasService.obtenerEspaciosCriticos());
    }

    /**
     * GET /api/alertas/contador
     * Obtiene el contador de alertas (críticas, advertencias, total)
     */
    @GetMapping("/contador")
    public ResponseEntity<Map<String, Integer>> contarAlertas() {
        return ResponseEntity.ok(alertasService.contarAlertas());
    }
}
