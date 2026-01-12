package com.parqueadero.controller;

import com.parqueadero.dto.VehiculoRequest;
import com.parqueadero.model.Vehiculo;
import com.parqueadero.service.VehiculoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehiculos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<Vehiculo> registrarVehiculo(@Valid @RequestBody VehiculoRequest request) {
        Vehiculo vehiculo = vehiculoService.registrarVehiculo(request);
        return new ResponseEntity<>(vehiculo, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<Vehiculo> obtenerPorId(@PathVariable Long id) {
        Vehiculo vehiculo = vehiculoService.obtenerPorId(id);
        return ResponseEntity.ok(vehiculo);
    }

    @GetMapping("/placa/{placa}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<Vehiculo> obtenerPorPlaca(@PathVariable String placa) {
        Vehiculo vehiculo = vehiculoService.obtenerPorPlaca(placa);
        return ResponseEntity.ok(vehiculo);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<List<Vehiculo>> listarTodos() {
        List<Vehiculo> vehiculos = vehiculoService.listarTodos();
        return ResponseEntity.ok(vehiculos);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<List<Vehiculo>> buscarVehiculos(@RequestParam String q) {
        List<Vehiculo> vehiculos = vehiculoService.buscarVehiculos(q);
        return ResponseEntity.ok(vehiculos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<Vehiculo> actualizarVehiculo(@PathVariable Long id, 
                                                        @Valid @RequestBody VehiculoRequest request) {
        Vehiculo vehiculo = vehiculoService.actualizarVehiculo(id, request);
        return ResponseEntity.ok(vehiculo);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> eliminarVehiculo(@PathVariable Long id) {
        vehiculoService.eliminarVehiculo(id);
        return ResponseEntity.ok("Vehículo eliminado exitosamente");
    }
}
