package com.parqueadero.service;

import com.parqueadero.dto.VehiculoRequest;
import com.parqueadero.exception.BusinessException;
import com.parqueadero.exception.ResourceNotFoundException;
import com.parqueadero.model.Vehiculo;
import com.parqueadero.pattern.factory.VehiculoFactory;
import com.parqueadero.repository.VehiculoRepository;
import com.parqueadero.util.PlacaUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private VehiculoFactory vehiculoFactory;

    @Transactional
    public Vehiculo registrarVehiculo(VehiculoRequest request) {
        // Normalizar y validar placa
        String placaNormalizada = PlacaUtil.normalizar(request.getPlaca());
        request.setPlaca(placaNormalizada);
        
        if (vehiculoRepository.existsByPlaca(placaNormalizada)) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + PlacaUtil.formatear(placaNormalizada));
        }

        Vehiculo vehiculo = vehiculoFactory.crearVehiculo(
                request.getPlaca(),
                request.getTipo(),
                request.getMarca(),
                request.getModelo(),
                request.getColor()
        );

        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo obtenerPorId(Long id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehiculo", "id", id));
    }

    public Vehiculo obtenerPorPlaca(String placa) {
        String placaNormalizada = PlacaUtil.normalizar(placa);
        return vehiculoRepository.findByPlaca(placaNormalizada)
                .orElseThrow(() -> new ResourceNotFoundException("Vehiculo", "placa", PlacaUtil.formatear(placaNormalizada)));
    }

    public List<Vehiculo> listarTodos() {
        return vehiculoRepository.findAll();
    }

    @Transactional
    public Vehiculo actualizarVehiculo(Long id, VehiculoRequest request) {
        Vehiculo vehiculo = obtenerPorId(id);
        
        vehiculo.setMarca(request.getMarca());
        vehiculo.setModelo(request.getModelo());
        vehiculo.setColor(request.getColor());
        
        return vehiculoRepository.save(vehiculo);
    }

    @Transactional
    public void eliminarVehiculo(Long id) {
        Vehiculo vehiculo = obtenerPorId(id);
        vehiculoRepository.delete(vehiculo);
    }
    
    public List<Vehiculo> buscarVehiculos(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return vehiculoRepository.buscarPorPlaca(query);
    }
}
