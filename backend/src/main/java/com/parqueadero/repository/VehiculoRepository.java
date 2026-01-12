package com.parqueadero.repository;

import com.parqueadero.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    
    Optional<Vehiculo> findByPlaca(String placa);
    
    Boolean existsByPlaca(String placa);
    
    @Query("SELECT v FROM Vehiculo v WHERE " +
           "UPPER(v.placa) LIKE UPPER(CONCAT('%', :query, '%')) " +
           "ORDER BY v.fechaCreacion DESC")
    List<Vehiculo> buscarPorPlaca(@Param("query") String query);
}
