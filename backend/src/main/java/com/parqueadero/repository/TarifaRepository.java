package com.parqueadero.repository;

import com.parqueadero.model.Tarifa;
import com.parqueadero.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TarifaRepository extends JpaRepository<Tarifa, Long> {
    
    Optional<Tarifa> findByTipoVehiculoAndActivaTrue(Vehiculo.TipoVehiculo tipoVehiculo);
}
