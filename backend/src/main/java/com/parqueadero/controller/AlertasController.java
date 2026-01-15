package com.parqueadero.controller;

import com.parqueadero.dto.AlertaDTO;
import com.parqueadero.service.AlertasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alertas")
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
