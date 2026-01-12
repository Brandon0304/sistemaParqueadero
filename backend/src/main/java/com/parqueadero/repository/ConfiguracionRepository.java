package com.parqueadero.repository;

import com.parqueadero.model.Configuracion;
import com.parqueadero.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, Long> {
    
    Optional<Configuracion> findByTipoVehiculo(Vehiculo.TipoVehiculo tipoVehiculo);
    
    List<Configuracion> findByActivaTrue();
}
