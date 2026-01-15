package com.parqueadero.controller;

import com.parqueadero.dto.*;
import com.parqueadero.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estadisticas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    /**
     * GET /api/estadisticas/ocupacion-por-hora
     * Ocupación del parqueadero por hora (últimas 24 horas)
     */
    @GetMapping("/ocupacion-por-hora")
    public ResponseEntity<List<EstadisticaOcupacionDTO>> obtenerOcupacionPorHora() {
        return ResponseEntity.ok(estadisticasService.obtenerOcupacionPorHora());
    }

    /**
     * GET /api/estadisticas/ingresos-diarios
     * Ingresos diarios de los últimos 7 días
     */
    @GetMapping("/ingresos-diarios")
    public ResponseEntity<List<EstadisticaIngresosDTO>> obtenerIngresosDiarios() {
        return ResponseEntity.ok(estadisticasService.obtenerIngresosDiarios());
    }

    /**
     * GET /api/estadisticas/distribucion-vehiculos
     * Distribución de vehículos por tipo (actualmente activos)
     */
    @GetMapping("/distribucion-vehiculos")
    public ResponseEntity<List<EstadisticaDistribucionDTO>> obtenerDistribucionVehiculos() {
        return ResponseEntity.ok(estadisticasService.obtenerDistribucionVehiculos());
    }

    /**
     * GET /api/estadisticas/tiempo-promedio
     * Tiempo promedio de estadía en minutos (día actual)
     */
    @GetMapping("/tiempo-promedio")
    public ResponseEntity<Double> obtenerTiempoPromedioEstadia() {
        return ResponseEntity.ok(estadisticasService.obtenerTiempoPromedioEstadia());
    }

    /**
     * GET /api/estadisticas/resumen-hoy
     * Resumen completo del día actual
     */
    @GetMapping("/resumen-hoy")
    public ResponseEntity<ResumenHoyDTO> obtenerResumenHoy() {
        return ResponseEntity.ok(estadisticasService.obtenerResumenHoy());
    }
}
